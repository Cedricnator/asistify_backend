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
} from './audio-utils';

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

            // Send initial greeting to start the conversation
            this.logger.log('Sending initial greeting to Gemini...');
            await agent.sendText(
                'Hello! I can hear you now. How can I help you today?',
            );

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
            if (buffer.length % 50 === 0) {
                this.logger.debug(
                    `Buffering audio... (${buffer.length} packets)`,
                );
            }
            return;
        }

        // Convert μ-law 8kHz to PCM 16kHz for Gemini
        const pcm16khz = twilioToGeminiAudio(audioBuffer);

        // Check audio signal every 100 packets for monitoring
        this.audioCheckCounter++;
        if (this.audioCheckCounter % 100 === 1) {
            const hasSignal = hasAudioSignal(pcm16khz);
            const timestamp = new Date().toISOString().split('T')[1];
            this.logger.log(
                `[${timestamp}] Audio signal: ${hasSignal} (packet ${this.audioCheckCounter})`,
            );
        }

        // Send audio to Gemini - it will automatically handle VAD and turn detection
        try {
            await agent.sendAudio(pcm16khz);
        } catch (error) {
            this.logger.error('Error sending audio to Gemini:', error.message);
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

        // Close the WebSocket connection
        try {
            client.close();
            this.logger.log('WebSocket connection closed');
        } catch (error) {
            this.logger.error('Error closing WebSocket:', error.message);
        }
    }
}
