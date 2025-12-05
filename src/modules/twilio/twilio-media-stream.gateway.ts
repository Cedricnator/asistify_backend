import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'ws';
import { VoiceAgent } from '../receptionist/application/assistant/agents/voice-agent';
import { ReceptionistPersonality } from '../receptionist/application/assistant/types/receptionist-personality';
import { ConfigService } from '@nestjs/config';
import {
  twilioToGeminiAudio,
  geminiToTwilioAudio,
  hasAudioSignal,
  mulawToPcm8k,
} from './audio-utils';
import { CreateDateUseCase } from '../calendar/application/use-cases/create-date.use-case';
import { AssistantManager } from '../receptionist/application/assistant/assistant-manager';

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
  // When true for a client, handleMedia will not forward audio to Gemini
  private sendingBlocked: Map<any, boolean> = new Map();
  // Duration of the last audio response sent to Twilio (ms)
  private lastResponseDurationMs: Map<any, number> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly createDateUseCase: CreateDateUseCase,
    private readonly assistantManager: AssistantManager,
  ) {}

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
    this.lastNonSilentAt.delete(client);
    this.lastForcedEndAt.delete(client);
    this.sendingBlocked.delete(client);
    this.lastResponseDurationMs.delete(client);
    this.lastResponseDurationMs.delete(client);
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

      case 'dtmf':
        this.handleDtmf(client, data);
        break;

      case 'stop':
        this.handleStreamStop(client, data);
        break;

      case 'mark':
        this.handleMark(client, data);
        break;

      case 'clear':
        this.handleClear(client, data);
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
    this.logger.log(`handleStreamStart data: ${JSON.stringify(data)}`);
    const customParams = data.start.customParameters;
    const receptionistId = customParams?.receptionistId;

    this.initializeAgent(client, data.streamSid, receptionistId).catch(
      (error) => {
        this.logger.error('Error initializing agent:', error);
        this.logger.error('Error stack:', error.stack);
      },
    );
  }

  /**
   * Initialize agent asynchronously
   */
  private async initializeAgent(
    client: any,
    streamSid: string,
    receptionistId?: string,
  ) {
    try {
      let agent: VoiceAgent;

      // Default personality for AI receptionist
      const defaultPersonality: ReceptionistPersonality = {
        name: 'AI Receptionist',
        levelFormality: 7, // Professional but friendly
        levelDynamism: 8, // Energetic and engaging
        enterpriseInformation: null,
        clientInformation: null,
        businessRestrictions: null,
      };

      if (receptionistId) {
        this.logger.log(
          `Initializing session for receptionist ID: ${receptionistId}`,
        );
        // Use AssistantManager to initialize session with full context
        agent = await this.assistantManager.initializeVoiceSession(
          defaultPersonality,
          receptionistId,
        );
      } else {
        // Fallback: Create new VoiceAgent manually
        this.logger.warn(
          'No receptionistId provided. Using default personality and no calendar.',
        );
        agent = new VoiceAgent(this.configService, this.createDateUseCase);
        await agent.onModuleInit(); // Manually init
        await agent.initializeSession(defaultPersonality, 'default-id');
      }

      // Store the agent session immediately
      this.sessions.set(client, agent);

      // Set up audio response handler - send audio back to Twilio
      agent.onAudioResponse((audioBuffer: Buffer) => {
        this.logger.log(
          `Received ${audioBuffer.length} bytes from Gemini (24kHz PCM)`,
        );

        // Calculate duration of this response for timing silence detection
        const durationMs = (audioBuffer.length / 2 / 24000) * 1000;
        this.lastResponseDurationMs.set(client, durationMs);
        this.logger.debug(`Response duration: ${durationMs.toFixed(0)}ms`);

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

      // When the agent signals that generation is complete, re-enable sending
      if (typeof agent.onGenerationComplete === 'function') {
        agent.onGenerationComplete(async () => {
          // No delay needed for full duplex
          this.logger.debug('Generation complete signal received');
        });
      }

      // Connect to Gemini with personality
      // Note: If AssistantManager was used, it might have fetched a specific personality.
      // Ideally, we should use THAT personality to connect.
      // But for now, we pass defaultPersonality or rely on the agent to handle it.
      // VoiceAgent.connect() currently requires personality to build system instruction.
      // If agent was initialized via AssistantManager, it has the personality stored internally.
      // We should update VoiceAgent.connect to use stored personality if available.
      // For now, we pass defaultPersonality as a fallback if we don't have the real one handy here.
      // This is a limitation we should fix in VoiceAgent later.
      await agent.connect();

      this.logger.log('Voice agent connected and ready');

      // Flush buffered audio
      const bufferedAudio = this.audioBuffers.get(client) || [];
      if (bufferedAudio.length > 0) {
        this.logger.log(
          `Flushing ${bufferedAudio.length} buffered audio chunks`,
        );
        for (const audioBuffer of bufferedAudio) {
          try {
            const geminiPayload = twilioToGeminiAudio(audioBuffer);
            await agent.sendAudio(geminiPayload);
          } catch (error) {
            this.logger.error('Error sending buffered audio:', error);
          }
        }
        this.audioBuffers.set(client, []);
      }

      // Send an initial text message to start the conversation (for debugging)
      try {
        // const date = new Date();
        // date.setDate(date.getDate() + 1);
        await agent.sendText('Hola');
        this.logger.log('Sent initial greeting to Gemini');
      } catch (err) {
        this.logger.error(
          'Error sending initial greeting:',
          err?.message || err,
        );
      }

      // Removed blocking to allow immediate interaction
      // this.sendingBlocked.set(client, true);

      // Wait a moment for Gemini to fully initialize
      await new Promise((resolve) => setTimeout(resolve, 500));
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

    if (this.sendingBlocked.get(client)) {
      // this.logger.log('Blocked');
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
        this.logger.debug(`Buffering audio... (${buffer.length} packets)`);
      }
      return;
    }

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
      // In Push-to-Talk mode, we trust the mute state.
      // If we are not blocked (unmuted), we send ALL audio, even silence/background noise.
      // This ensures soft speech is not cut off.
      if (this.sendingBlocked.get(client) !== true) {
        // Send the prepared payload to the VoiceAgent (Gemini)
        await agent.sendAudio(geminiPayload);
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
    this.lastNonSilentAt.delete(client);
    this.lastForcedEndAt.delete(client);
    this.sendingBlocked.delete(client);
    this.lastResponseDurationMs.delete(client);

    // Close the WebSocket connection
    try {
      client.close();
      this.logger.log('WebSocket connection closed');
    } catch (error) {
      this.logger.error('Error closing WebSocket:', error.message);
    }
  }

  /**
   * Handle 'mute' event - mute state changed
   */
  private handleDtmf(client: any, data: any) {
    this.logger.log(`DTMF event received: ${JSON.stringify(data)}`);

    const digit = data.dtmf.digit;
    let isMuted: boolean = false;

    switch (digit) {
      case '1':
        isMuted = true;
        // When user mutes (finishes talking), force end the turn immediately
        // This tells Gemini "I'm done talking, now you respond"
        const agent = this.sessions.get(client);
        if (agent) {
          agent.forceEndTurn().catch((err) => {
            this.logger.error('Error forcing end turn on mute:', err);
          });
        }
        break;
      case '0':
        isMuted = false;
        break;
      default:
    }
    this.sendingBlocked.set(client, isMuted);
    this.logger.log(`Mute state changed: ${isMuted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Handle 'mark' event - audio playback finished
   */
  private handleMark(client: any, data: any) {
    this.logger.log(`Mark event received: ${data.mark.name}`);
    // If we wanted to unblock here instead of estimating duration, we could.
    // But Gemini sends audio in chunks, so we get many marks.
    // We'd need to know which mark corresponds to the END of the response.
  }

  /**
   * Handle 'clear' event - stream cleared (interruption)
   */
  private handleClear(client: any, data: any) {
    this.logger.log('Clear event received');
    // If the stream was cleared, it means we interrupted the bot.
    // We should ensure we are ready to listen.
    this.sendingBlocked.set(client, false);
  }
}
