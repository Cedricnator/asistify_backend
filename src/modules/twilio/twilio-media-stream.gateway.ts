import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'ws';
import { VoiceAgent } from '../receptionist/assistant/agents/voice-agent';
import { ReceptionistPersonality } from '../receptionist/assistant/types/receptionist-personality';
import { ConfigService } from '@nestjs/config';
import {
    twilioToGeminiAudio,
    geminiToTwilioAudio,
    hasAudioSignal,
    mulawToPcm8k,
} from './audio-utils';
import * as fs from 'fs';
import * as path from 'path';
import { WaveFile } from 'wavefile';

/**
 * Twilio Media Streams Gateway
 *
 * Handles WebSocket connections from Twilio for real-time audio streaming.
 * Connects Twilio's audio stream to Gemini Live API for AI conversation.
 */
@WebSocketGateway({
    path: '/twilio/media-stream',
    transports: ['websocket'],
})
export class TwilioMediaStreamGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(TwilioMediaStreamGateway.name);
    private sessions: Map<any, VoiceAgent> = new Map(); // Use client object as key
    private streamIds: Map<string, any> = new Map(); // Map streamSid to client
    private audioBuffers: Map<any, Buffer[]> = new Map(); // Buffer audio while connecting
    private audioCheckCounter = 0; // Counter for periodic audio checks
    // Buffers to accumulate Gemini-bound PCM per client for larger debug files
    private geminiSaveBuffers: Map<
        any,
        { buffers: Buffer[]; byteCount: number; lastAppend: number }
    > = new Map();
    // Buffers to accumulate pre-resample PCM (8k) per client for debugging
    private geminiPreSaveBuffers: Map<
        any,
        { buffers: Buffer[]; byteCount: number; lastAppend: number }
    > = new Map();

    // Track last time non-silent audio was seen per client (ms since epoch)
    private lastNonSilentAt: Map<any, number> = new Map();
    // Track last time we forced an end-turn per client to avoid spamming
    private lastForcedEndAt: Map<any, number> = new Map();

    constructor(private readonly configService: ConfigService) {}

    /**
     * Handle new WebSocket connection from Twilio
     */
    handleConnection(client: any) {
        this.logger.log(`Twilio Media Stream connected`);

        // Set up message handler for raw WebSocket
        client.on('message', async (message: any) => {
            try {
                const data = JSON.parse(message.toString());
                await this.handleMessage(client, data);
            } catch (error) {
                this.logger.error('Error parsing message:', error.message);
            }
        });
    }

    /**
     * Merge an array of raw PCM Buffers with a linear crossfade of overlapSamples
     * (number of samples) applied between adjacent buffers. Buffers are 16-bit
     * signed little-endian. Returns a single Buffer.
     */
    private mergeWithCrossfade(
        buffers: Buffer[],
        overlapSamples: number,
    ): Buffer {
        if (!buffers || buffers.length === 0) return Buffer.alloc(0);
        if (buffers.length === 1 || overlapSamples <= 0)
            return Buffer.concat(buffers);

        // Start with first buffer
        let output = Buffer.from(buffers[0]);

        for (let i = 1; i < buffers.length; i++) {
            const curr = buffers[i];

            // Determine actual overlap in samples taking into account small buffers
            const maxOverlap = Math.floor(
                Math.min(output.length, curr.length) / 2,
            );
            const oSamples = Math.min(overlapSamples, maxOverlap);
            const oBytes = oSamples * 2;

            if (oSamples <= 0) {
                // Simple append
                output = Buffer.concat([output, curr]);
                continue;
            }

            const tailStart = output.length - oBytes;
            const tail = output.slice(tailStart);
            const head = curr.slice(0, oBytes);

            const blended = Buffer.alloc(oBytes);
            for (let s = 0; s < oSamples; s++) {
                const a = tail.readInt16LE(s * 2);
                const b = head.readInt16LE(s * 2);

                // linear ramp: weightPrev decreases, weightCurr increases
                const weightCurr = s / (oSamples - 1 || 1);
                const weightPrev = 1 - weightCurr;
                let mixed = Math.round(a * weightPrev + b * weightCurr);
                if (mixed > 32767) mixed = 32767;
                if (mixed < -32768) mixed = -32768;
                blended.writeInt16LE(mixed, s * 2);
            }

            // Build new output: output[0:tailStart] + blended + curr[oBytes:]
            output = Buffer.concat([
                output.slice(0, tailStart),
                blended,
                curr.slice(oBytes),
            ]);
        }

        return output;
    }

    /**
     * Handle WebSocket disconnection
     */
    handleDisconnect(client: any) {
        this.logger.log(`Twilio Media Stream disconnected`);

        // Clean up voice agent session
        const agent = this.sessions.get(client);
        if (agent) {
            agent.endSession();
            this.sessions.delete(client);
        }

        // Clean up audio buffer
        this.audioBuffers.delete(client);
    }

    /**
     * Handle incoming messages from Twilio
     */
    private async handleMessage(client: any, data: any) {
        // Only log non-media events to reduce spam
        if (data.event !== 'media') {
            this.logger.debug(`Message type: ${data.event}`);
        }

        switch (data.event) {
            case 'connected':
                this.handleConnected(client, data);
                break;

            case 'start':
                await this.handleStreamStart(client, data);
                break;

            case 'media':
                await this.handleMedia(client, data);
                break;

            case 'stop':
                this.handleStreamStop(client, data);
                break;

            default:
                this.logger.debug(`Unhandled event: ${data.event}`);
        }
    }

    /**
     * Handle 'connected' event from Twilio
     */
    private handleConnected(client: any, data: any) {
        this.logger.log('Twilio Media Stream connected event received');
        this.logger.debug('Protocol:', data.protocol);
    }

    /**
     * Handle 'start' event - stream begins
     */
    private async handleStreamStart(client: any, data: any) {
        this.logger.log(`Media stream started: ${data.streamSid}`);
        this.logger.debug('Stream metadata:', JSON.stringify(data.start));

        // Store mapping of streamSid to client
        this.streamIds.set(data.streamSid, client);

        // Initialize audio buffer for this client
        this.audioBuffers.set(client, []);

        // Initialize agent asynchronously (non-blocking)
        this.initializeAgent(client, data.streamSid).catch((error) => {
            this.logger.error('Error initializing agent:', error);
            this.logger.error('Error stack:', error.stack);
        });
    }

    /**
     * Initialize agent asynchronously
     */
    private async initializeAgent(client: any, streamSid: string) {
        try {
            // Create new VoiceAgent for this call
            const agent = new VoiceAgent(this.configService);

            // Store the agent session immediately
            this.sessions.set(client, agent);

            // Manually initialize the agent (since we're not using DI)
            await agent.onModuleInit();

            // Set up audio response handler - send audio back to Twilio
            agent.onAudioResponse((audioBuffer: Buffer) => {
                this.logger.log(
                    `Received ${audioBuffer.length} bytes from Gemini (24kHz PCM)`,
                );

                // Convert Gemini's PCM 24kHz to Twilio's μ-law 8kHz
                const twilioAudio = geminiToTwilioAudio(audioBuffer);

                this.logger.debug(
                    `Converted to ${twilioAudio.length} bytes μ-law 8kHz for Twilio`,
                );

                const payload = {
                    event: 'media',
                    streamSid: streamSid,
                    media: {
                        payload: twilioAudio.toString('base64'),
                    },
                };
                client.send(JSON.stringify(payload));
            });

            // Default personality for AI receptionist
            const personality: ReceptionistPersonality = {
                name: 'AI Receptionist',
                levelFormality: 7, // Professional but friendly
                levelDynamism: 8, // Energetic and engaging
                enterpriseInformation: null,
                clientInformation: null,
                businessRestrictions: null,
            };

            // Connect to Gemini with personality
            await agent.connect(personality);

            this.logger.log('Voice agent connected and ready');

            // Wait a moment for Gemini to fully initialize
            await new Promise((resolve) => setTimeout(resolve, 500));

            // // Optional testing aid: send a canned test audio file once when the
            // // agent is initialized. This avoids repeatedly sending the test
            // // file on every media packet. The gateway looks first in docs/16000.wav
            // // then falls back to ./16000.wav.
            // try {
            //     const docsPath = path.join(process.cwd(), 'docs', '16000.wav');
            //     const rootPath = path.join(process.cwd(), '16000.wav');
            //     let testFilePath = docsPath;
            //     if (!fs.existsSync(testFilePath)) testFilePath = rootPath;

            //     if (fs.existsSync(testFilePath)) {
            //         this.logger.log(
            //             `Sending test audio once from: ${testFilePath}`,
            //         );
            //         const fileBuf = fs.readFileSync(testFilePath);
            //         const wavFile = new WaveFile(fileBuf);
            //         wavFile.toSampleRate(16000);
            //         wavFile.toBitDepth('16');
            //         const samples = Array.from(
            //             wavFile.getSamples(false) as Float64Array,
            //         );
            //         const pcmBuffer = Buffer.alloc(samples.length * 2);
            //         for (let i = 0; i < samples.length; i++) {
            //             const s = samples[i];
            //             let intSample = 0;
            //             if (typeof s === 'number' && Number.isFinite(s)) {
            //                 if (Math.abs(s) <= 1)
            //                     intSample = Math.round(s * 32767);
            //                 else intSample = Math.round(s);
            //             }
            //             if (intSample > 32767) intSample = 32767;
            //             if (intSample < -32768) intSample = -32768;
            //             pcmBuffer.writeInt16LE(intSample, i * 2);
            //         }
            //         // Stream the test audio in smaller chunks to emulate realtime
            //         // input and allow the Live API's VAD to detect end-of-speech.
            //         const sampleRate = 16000;
            //         const bytesPerSample = 2; // int16
            //         const chunkMs = Number(
            //             this.configService.get('TEST_AUDIO_CHUNK_MS') || 100,
            //         );
            //         const chunkSamples = Math.floor(
            //             (chunkMs / 1000) * sampleRate,
            //         );
            //         const chunkBytes = chunkSamples * bytesPerSample;

            //         let sentChunks = 0;
            //         for (
            //             let offset = 0;
            //             offset < pcmBuffer.length;
            //             offset += chunkBytes
            //         ) {
            //             const end = Math.min(
            //                 offset + chunkBytes,
            //                 pcmBuffer.length,
            //             );
            //             const slice = pcmBuffer.slice(offset, end);
            //             await agent.sendAudio(slice);
            //             sentChunks++;
            //         }

            //         // Append a short silence to help VAD/end-of-speech detection
            //         const silenceMs = Number(
            //             this.configService.get('TEST_AUDIO_END_SILENCE_MS') ||
            //                 300,
            //         );
            //         if (silenceMs > 0) {
            //             const silenceSamples = Math.floor(
            //                 (silenceMs / 1000) * sampleRate,
            //             );
            //             const silenceBuf = Buffer.alloc(
            //                 silenceSamples * bytesPerSample,
            //                 0,
            //             );
            //             await agent.sendAudio(silenceBuf);
            //             this.logger.log(
            //                 `Appended ${silenceMs}ms silence to test stream to help VAD.`,
            //             );
            //         }
            //         // Optionally force the live session to treat this as a completed turn
            //         // Useful when VAD isn't reliably triggering. Enable with FORCE_TURN_COMPLETE=true
            //         const forceTurn = !!this.configService.get(
            //             'FORCE_TURN_COMPLETE',
            //         );
            //         if (forceTurn) {
            //             try {
            //                 await agent.forceEndTurn();
            //                 this.logger.log(
            //                     'Forced turnComplete after test audio (FORCE_TURN_COMPLETE=true)',
            //                 );
            //             } catch (err) {
            //                 this.logger.error(
            //                     'Error forcing turnComplete:',
            //                     err?.message || err,
            //                 );
            //             }
            //         }
            //         this.logger.log(
            //             `Test audio streamed to Gemini in ${sentChunks} chunks (chunkMs=${chunkMs}ms)`,
            //         );
            //     } else {
            //         this.logger.debug(
            //             'No test audio file found for one-shot send',
            //         );
            //     }
            // } catch (err) {
            //     this.logger.error(
            //         'Error sending one-shot test audio:',
            //         err?.message || err,
            //     );
            // }

            // Send initial greeting to start the conversation
            // this.logger.log('Sending initial greeting to Gemini...');
            // await agent.sendText(
            //     'Hello! I can hear you now. How can I help you today?',
            // );

            // Clear buffered audio - skip it for now to test if that's causing the issue
            const bufferedAudio = this.audioBuffers.get(client) || [];
            if (bufferedAudio.length > 0) {
                this.logger.log(
                    `Skipping ${bufferedAudio.length} buffered audio packets for testing`,
                );
                this.audioBuffers.set(client, []);
            }
        } catch (error) {
            this.logger.error('Error starting voice agent:', error);
            this.logger.error('Error stack:', error.stack);
        }
    }

    /**
     * Handle 'media' event - incoming audio from Twilio
     */
    private async handleMedia(client: any, data: any) {
        const agent = this.sessions.get(client);
        if (!agent) {
            this.logger.warn('No agent found for this connection');
            return;
        }

        // data.media.payload is base64-encoded μ-law audio (8kHz, mono)
        const audioPayload = data.media.payload;
        const audioBuffer = Buffer.from(audioPayload, 'base64');

        // Check if agent is connected to Gemini
        if (!agent.isSessionConnected()) {
            // Buffer audio while agent is connecting
            const buffer = this.audioBuffers.get(client) || [];
            buffer.push(audioBuffer);
            this.audioBuffers.set(client, buffer);

            // Log only occasionally to avoid spam
            if (buffer.length % 100 === 0) {
                this.logger.debug(
                    `Buffering audio... (${buffer.length} packets)`,
                );
            }
            return;
        }

        // Placeholder variables (kept for compatibility with the original flow)
        let geminiPayload: { mimeType: string; data: string } | null = null;
        let pcm16khz: Buffer = Buffer.alloc(0);
        let pcm8khz: Buffer = Buffer.alloc(0);

        // Convert μ-law 8kHz to a ready-to-send payload for Gemini (base64 + mimeType)
        geminiPayload = twilioToGeminiAudio(audioBuffer);

        // Also expose the decoded PCM buffer for signal checks
        pcm16khz = Buffer.from(geminiPayload.data, 'base64');

        // Decode pre-resample μ-law to PCM 8kHz for debugging comparison
        pcm8khz = mulawToPcm8k(audioBuffer);

        // Send real Twilio audio to Gemini Live API
        try {
            const hasSignal = hasAudioSignal(pcm16khz);

            const now = Date.now();
            if (hasSignal) {
                // Update last-non-silent timestamp
                this.lastNonSilentAt.set(client, now);

                // Send the prepared payload to the VoiceAgent (Gemini)
                await agent.sendAudio(geminiPayload);
            } else {
                // No signal detected in this packet. Check if we've seen
                // silence for longer than the configured threshold and
                // if so, optionally force end the turn.
                const silenceThresholdMs = Number(
                    this.configService.get('SILENCE_FORCE_END_MS') || 700,
                );
                const throttleMs = Number(
                    this.configService.get('SILENCE_FORCE_THROTTLE_MS') || 2000,
                );

                const lastNonSilent = this.lastNonSilentAt.get(client) || now;
                const elapsed = now - lastNonSilent;
                if (elapsed >= silenceThresholdMs) {
                    const lastForced = this.lastForcedEndAt.get(client) || 0;
                    if (now - lastForced >= throttleMs) {
                        try {
                            await agent.forceEndTurn();
                            this.lastForcedEndAt.set(client, now);
                            this.logger.log(
                                `Forced turnComplete after ${elapsed}ms of silence (threshold=${silenceThresholdMs}ms)`,
                            );
                        } catch (err) {
                            this.logger.error(
                                'Error forcing turnComplete:',
                                err?.message || err,
                            );
                        }
                    }
                }

                // Skip sending the silent frame to Gemini to avoid churn
                this.logger.debug(
                    'Skipping send: no audio signal detected in incoming Twilio packet',
                );
                return;
            }

            // Optionally save Gemini-bound PCM for debugging (paired pre/post)
            const saveEnabled = !!this.configService.get('SAVE_GEMINI_AUDIO');
            if (saveEnabled) {
                try {
                    // Append post-resample 16k PCM
                    const existing = this.geminiSaveBuffers.get(client) || {
                        buffers: [],
                        byteCount: 0,
                        lastAppend: 0,
                    };
                    existing.buffers.push(pcm16khz);
                    existing.byteCount += pcm16khz.length;
                    existing.lastAppend = Date.now();
                    this.geminiSaveBuffers.set(client, existing);

                    // Append pre-resample 8k PCM
                    const preExisting = this.geminiPreSaveBuffers.get(
                        client,
                    ) || {
                        buffers: [],
                        byteCount: 0,
                        lastAppend: 0,
                    };
                    preExisting.buffers.push(pcm8khz);
                    preExisting.byteCount += pcm8khz.length;
                    preExisting.lastAppend = Date.now();
                    this.geminiPreSaveBuffers.set(client, preExisting);

                    // Flush if we've collected more than the configured chunk seconds
                    const chunkSeconds = Number(
                        this.configService.get('SAVE_GEMINI_CHUNK_SECONDS') ||
                            3,
                    );
                    const bytesThreshold =
                        Math.max(1, chunkSeconds) * 16000 * 2; // seconds * sampleRate * bytesPerSample
                    if (existing.byteCount >= bytesThreshold) {
                        const crossfadeMs = Number(
                            this.configService.get(
                                'SAVE_GEMINI_CROSSFADE_MS',
                            ) || 10,
                        );
                        const overlapSamples = Math.max(
                            0,
                            Math.floor((crossfadeMs / 1000) * 16000),
                        );
                        const combined = this.mergeWithCrossfade(
                            existing.buffers,
                            overlapSamples,
                        );

                        const tmpDir = path.join(process.cwd(), 'tmp');
                        if (!fs.existsSync(tmpDir))
                            fs.mkdirSync(tmpDir, { recursive: true });
                        const ts = Date.now();
                        const baseName = `gemini-chunk-${ts}-${this.audioCheckCounter}`;
                        const pcmPath = path.join(tmpDir, `${baseName}.pcm`);
                        fs.writeFileSync(pcmPath, combined);

                        const samples: number[] = [];
                        for (let i = 0; i < combined.length; i += 2)
                            samples.push(combined.readInt16LE(i));
                        const wav = new WaveFile();
                        wav.fromScratch(1, 16000, '16', samples);
                        const wavPath = path.join(tmpDir, `${baseName}.wav`);
                        fs.writeFileSync(wavPath, wav.toBuffer());

                        this.logger.log(
                            `Saved Gemini debug chunk: ${pcmPath}, ${wavPath}`,
                        );

                        // Also flush paired pre-resample 8k
                        try {
                            const overlapSamples8 = Math.max(
                                0,
                                Math.floor((crossfadeMs / 1000) * 8000),
                            );
                            const combined8 = this.mergeWithCrossfade(
                                preExisting.buffers,
                                overlapSamples8,
                            );
                            const pcm8Path = path.join(
                                tmpDir,
                                `${baseName}-pre8k.pcm`,
                            );
                            fs.writeFileSync(pcm8Path, combined8);
                            const samples8: number[] = [];
                            for (let i = 0; i < combined8.length; i += 2)
                                samples8.push(combined8.readInt16LE(i));
                            const wav8 = new WaveFile();
                            wav8.fromScratch(1, 8000, '16', samples8);
                            const wav8Path = path.join(
                                tmpDir,
                                `${baseName}-pre8k.wav`,
                            );
                            fs.writeFileSync(wav8Path, wav8.toBuffer());
                            this.logger.log(
                                `Saved paired pre-resample chunk: ${pcm8Path}, ${wav8Path}`,
                            );
                        } catch (err) {
                            this.logger.error(
                                'Error saving pre-resample debug chunk:',
                                err?.message || err,
                            );
                        }

                        // Reset buffers for this client
                        this.geminiSaveBuffers.set(client, {
                            buffers: [],
                            byteCount: 0,
                            lastAppend: 0,
                        });
                        this.geminiPreSaveBuffers.set(client, {
                            buffers: [],
                            byteCount: 0,
                            lastAppend: 0,
                        });
                        this.audioCheckCounter++;
                    }
                } catch (err) {
                    this.logger.error(
                        'Error saving Gemini debug audio:',
                        err?.message || err,
                    );
                }
            }
        } catch (err) {
            this.logger.error(
                'Error sending Twilio audio to Gemini:',
                err?.message || err,
            );
        }
    }

    /**
     * Handle 'stop' event - stream ends
     */
    private handleStreamStop(client: any, data: any) {
        this.logger.log(`Media stream stopped: ${data.streamSid}`);

        // Clean up agent session
        const agent = this.sessions.get(client);
        if (agent) {
            agent.endSession();
            this.sessions.delete(client);
        }

        // Clean up all client-related data
        this.streamIds.delete(data.streamSid);
        this.audioBuffers.delete(client);

        // Flush and remove any pending Gemini save buffer for this client
        try {
            const entry = this.geminiSaveBuffers.get(client);
            if (entry && entry.byteCount > 0) {
                // Merge with crossfade when flushing on stop as well
                const crossfadeMs = Number(
                    this.configService.get('SAVE_GEMINI_CROSSFADE_MS') || 10,
                );
                const overlapSamples = Math.max(
                    0,
                    Math.floor((crossfadeMs / 1000) * 16000),
                );
                const combined = this.mergeWithCrossfade(
                    entry.buffers,
                    overlapSamples,
                );
                const tmpDir = path.join(process.cwd(), 'tmp');
                if (!fs.existsSync(tmpDir))
                    fs.mkdirSync(tmpDir, { recursive: true });
                const ts = Date.now();
                const baseName = `gemini-flush-${ts}-${this.audioCheckCounter}`;
                const pcmPath = path.join(tmpDir, `${baseName}.pcm`);
                fs.writeFileSync(pcmPath, combined);

                const samples: number[] = [];
                for (let i = 0; i < combined.length; i += 2) {
                    samples.push(combined.readInt16LE(i));
                }
                const wav = new WaveFile();
                wav.fromScratch(1, 16000, '16', samples);
                const wavBuf = wav.toBuffer();
                const wavPath = path.join(tmpDir, `${baseName}.wav`);
                fs.writeFileSync(wavPath, wavBuf);

                this.logger.log(
                    `Flushed pending Gemini audio files: ${pcmPath}, ${wavPath}`,
                );

                // Also flush paired pre-resample 8k buffers if present
                try {
                    const preEntry = this.geminiPreSaveBuffers.get(client);
                    if (preEntry && preEntry.byteCount > 0) {
                        const overlapSamples8 = Math.max(
                            0,
                            Math.floor((crossfadeMs / 1000) * 8000),
                        );
                        const combined8 = this.mergeWithCrossfade(
                            preEntry.buffers,
                            overlapSamples8,
                        );
                        const pcm8Path = path.join(
                            tmpDir,
                            `${baseName}-pre8k.pcm`,
                        );
                        fs.writeFileSync(pcm8Path, combined8);

                        const samples8: number[] = [];
                        for (let i = 0; i < combined8.length; i += 2) {
                            samples8.push(combined8.readInt16LE(i));
                        }
                        const wav8 = new WaveFile();
                        wav8.fromScratch(1, 8000, '16', samples8);
                        const wav8Path = path.join(
                            tmpDir,
                            `${baseName}-pre8k.wav`,
                        );
                        fs.writeFileSync(wav8Path, wav8.toBuffer());

                        this.logger.log(
                            `Flushed pending paired pre-resample files: ${pcm8Path}, ${wav8Path}`,
                        );
                    }
                } catch (err) {
                    this.logger.error(
                        'Error flushing pending pre-resample buffers:',
                        err?.message || err,
                    );
                } finally {
                    this.geminiPreSaveBuffers.delete(client);
                }
            }
        } catch (err) {
            this.logger.error(
                'Error flushing pending Gemini save buffer:',
                err?.message || err,
            );
        } finally {
            this.geminiSaveBuffers.delete(client);
        }

        // Close the WebSocket connection
        try {
            client.close();
            this.logger.log('WebSocket connection closed');
        } catch (error) {
            this.logger.error('Error closing WebSocket:', error.message);
        }
    }
}
