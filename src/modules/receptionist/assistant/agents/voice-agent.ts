import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Modality } from '@google/genai';
import { ReceptionistPersonality } from '../types/receptionist-personality';

/**
 * VoiceAgent - Gemini Live API integration for real-time voice interactions
 *
 * This service IS the session. Each instance represents an active voice streaming session.
 *
 * Usage:
 * ```typescript
 * const voiceSession = await voiceAgent.initializeSession(personality, receptionistId);
 * await voiceSession.connect(personality); // Start WebSocket connection
 *
 * // Send audio chunks (16-bit PCM, 16kHz, mono)
 * await voiceSession.sendAudio(audioBuffer);
 *
 * // Receive audio responses (24kHz PCM)
 * voiceSession.onAudioResponse((audioData) => {
 *   // Handle audio output (send to Twilio, play, etc.)
 * });
 * ```
 *
 * This service handles:
 * - Real-time audio streaming via WebSocket
 * - System prompt generation based on personality
 * - Session lifecycle management
 * - Voice Activity Detection (interruptions)
 * - Tool calling support (for future integration)
 *
 * Configuration (via .env):
 * - GEMINI_API_KEY: Your Google AI API key (required)
 * - GEMINI_MODEL: Model name (default: gemini-2.0-flash-live-001)
 * - GEMINI_TEMPERATURE: Creativity level 0-2 (default: 1.0)
 * - GEMINI_MAX_OUTPUT_TOKENS: Max response length (default: 8192)
 * - GEMINI_TOP_P: Nucleus sampling (default: 0.95)
 * - GEMINI_TOP_K: Top-k sampling (default: 40)
 */
@Injectable({ scope: Scope.TRANSIENT })
export class VoiceAgent implements OnModuleInit {
    private readonly logger = new Logger(VoiceAgent.name);
    private genAI: GoogleGenAI;
    private liveSession: any = null; // Live API session type
    private receptionistId: string;
    private receptionistName: string;
    private personality: {
        formality: number;
        dynamism: number;
    };
    private readonly modelName: string;
    private readonly config: {
        temperature: number;
        maxOutputTokens: number;
        topP: number;
        topK: number;
    };
    private audioResponseCallbacks: ((audioData: Buffer) => void)[] = [];
    private textResponseCallbacks: ((text: string) => void)[] = [];
    private isConnected = false;

    constructor(private readonly configService: ConfigService) {
        // Load configuration on construction
        this.modelName =
            this.configService.get<string>('gemini.model') ??
            'gemini-2.0-flash-live-001';
        this.config = {
            temperature:
                this.configService.get<number>('gemini.temperature') ?? 1.0,
            maxOutputTokens:
                this.configService.get<number>('gemini.maxOutputTokens') ??
                8192,
            topP: this.configService.get<number>('gemini.topP') ?? 0.95,
            topK: this.configService.get<number>('gemini.topK') ?? 40,
        };
    }

    async onModuleInit() {
        // Initialize Gemini on module startup
        const apiKey = this.configService.get<string>('gemini.apiKey');

        if (!apiKey) {
            this.logger.warn(
                'Gemini API key not found. Voice agent will not be available.',
            );
            return;
        }

        try {
            this.genAI = new GoogleGenAI({ apiKey });
            this.logger.log(
                `Voice agent initialized with Live API model: ${this.modelName}`,
            );
        } catch (error) {
            this.logger.error('Failed to initialize Gemini voice agent', error);
            throw error;
        }
    }

    /**
     * Initialize a session with receptionist personality
     * Returns THIS instance (self) as the ready-to-use session
     */
    async initializeSession(
        personality: ReceptionistPersonality,
        receptionistId: string,
    ): Promise<VoiceAgent> {
        this.logger.log(
            `Initializing Live API session for: ${personality.name}`,
        );

        if (!this.genAI) {
            throw new Error(
                'Voice agent not initialized. Check your Gemini API key.',
            );
        }

        // Store receptionist info in this instance
        this.receptionistId = receptionistId;
        this.receptionistName = personality.name;
        this.personality = {
            formality: personality.levelFormality,
            dynamism: personality.levelDynamism,
        };

        this.logger.log(
            `Session initialized for ${personality.name} - Formality: ${personality.levelFormality}/10, Dynamism: ${personality.levelDynamism}/10`,
        );

        // Return this instance as the session (connection happens when connect() is called)
        return this;
    }

    /**
     * Connect to Gemini Live API via WebSocket
     * Call this after initializeSession() to start the streaming session
     */
    async connect(personality: ReceptionistPersonality): Promise<void> {
        if (!this.genAI) {
            throw new Error(
                'Voice agent not initialized. Check your Gemini API key.',
            );
        }

        if (this.isConnected) {
            this.logger.warn('Already connected to Live API');
            return;
        }

        try {
            // Build system instruction based on personality
            const systemInstruction = this.buildSystemInstruction(personality);

            // Create Live API session with audio response modality
            this.liveSession = await this.genAI.live.connect({
                model: this.modelName,
                config: {
                    responseModalities: [Modality.AUDIO], // Request audio output
                    systemInstruction: systemInstruction,
                },
                callbacks: {
                    // Handle incoming messages
                    onmessage: (response) => {
                        // Debug: log the full response structure
                        this.logger.debug(
                            `Received response with keys: ${Object.keys(response).join(', ')}`,
                        );

                        // Handle audio in serverContent
                        if (response.serverContent?.modelTurn?.parts) {
                            const parts =
                                response.serverContent.modelTurn.parts;
                            parts.forEach((part: any) => {
                                // Handle inline audio data
                                if (part.inlineData?.data) {
                                    const audioData = Buffer.from(
                                        part.inlineData.data,
                                        'base64',
                                    );
                                    this.logger.log(
                                        `Received audio chunk: ${audioData.length} bytes (mimeType: ${part.inlineData.mimeType})`,
                                    );

                                    // Notify all registered callbacks
                                    this.audioResponseCallbacks.forEach(
                                        (callback) => {
                                            callback(audioData);
                                        },
                                    );
                                }

                                // Handle text responses
                                if (part.text) {
                                    this.logger.log(
                                        `Received text: ${part.text}`,
                                    );
                                    this.textResponseCallbacks.forEach(
                                        (callback) => {
                                            callback(part.text);
                                        },
                                    );
                                }
                            });
                        }

                        // Also check for direct data field (alternative structure)
                        if (response.data && !response.serverContent) {
                            this.logger.debug(
                                `Direct data field found: ${typeof response.data}`,
                            );
                            const audioData = Buffer.from(response.data);
                            this.audioResponseCallbacks.forEach((callback) => {
                                callback(audioData);
                            });
                        }
                    },
                    // Handle errors
                    onerror: (error) => {
                        this.logger.error('Live API error:', error);
                        this.isConnected = false;
                    },
                    // Handle connection close
                    onclose: () => {
                        this.logger.log('Live API session closed');
                        this.isConnected = false;
                    },
                    // Handle connection open
                    onopen: () => {
                        this.logger.log('Live API WebSocket connection opened');
                    },
                },
            });

            this.isConnected = true;
            this.logger.log(
                `Connected to Live API for ${this.receptionistName}`,
            );
        } catch (error) {
            this.logger.error('Error connecting to Live API', error);
            throw error;
        }
    }

    /**
     * Send audio data to Gemini Live API
     * @param audioBuffer - Audio data in 16-bit PCM, 16kHz, mono format
     */
    async sendAudio(audioBuffer: Buffer): Promise<void> {
        if (!this.liveSession || !this.isConnected) {
            throw new Error('Session not connected. Call connect() first.');
        }

        try {
            // Use sendRealtimeInput for audio chunks
            this.liveSession.sendRealtimeInput({
                media: {
                    data: audioBuffer,
                    mimeType: 'audio/pcm;rate=16000',
                },
            });

            this.logger.debug(`Sent audio chunk: ${audioBuffer.length} bytes`);
        } catch (error) {
            this.logger.error('Error sending audio', error);
            throw error;
        }
    }

    /**
     * Send text input to Gemini (for testing or mixed modality)
     * @param text - Text message
     */
    async sendText(text: string): Promise<void> {
        if (!this.liveSession || !this.isConnected) {
            throw new Error('Session not connected. Call connect() first.');
        }

        try {
            // Use sendClientContent for text input
            this.liveSession.sendClientContent({
                turns: [
                    {
                        role: 'user',
                        parts: [{ text }],
                    },
                ],
                turnComplete: true, // Indicates we're done sending and expect a response
            });
            this.logger.log(`Sent text: ${text}`);
        } catch (error) {
            this.logger.error('Error sending text', error);
            throw error;
        }
    }

    /**
     * Register a callback to receive audio responses
     * @param callback - Function to handle audio data (24kHz PCM)
     */
    onAudioResponse(callback: (audioData: Buffer) => void): void {
        this.audioResponseCallbacks.push(callback);
    }

    /**
     * Remove an audio response callback
     */
    offAudioResponse(callback: (audioData: Buffer) => void): void {
        const index = this.audioResponseCallbacks.indexOf(callback);
        if (index > -1) {
            this.audioResponseCallbacks.splice(index, 1);
        }
    }

    /**
     * Register a callback to receive text responses
     * @param callback - Function to handle text data
     */
    onTextResponse(callback: (text: string) => void): void {
        this.textResponseCallbacks.push(callback);
    }

    /**
     * Remove a text response callback
     */
    offTextResponse(callback: (text: string) => void): void {
        const index = this.textResponseCallbacks.indexOf(callback);
        if (index > -1) {
            this.textResponseCallbacks.splice(index, 1);
        }
    }

    /**
     * Get receptionist information for this session
     */
    getReceptionistInfo() {
        return {
            id: this.receptionistId,
            name: this.receptionistName,
            personality: this.personality,
        };
    }

    /**
     * Check if session is connected
     */
    isSessionConnected(): boolean {
        return this.isConnected;
    }

    /**
     * End the session and close WebSocket connection
     */
    async endSession() {
        this.logger.log(`Ending session for ${this.receptionistName}`);

        if (this.liveSession) {
            try {
                // Close the WebSocket connection
                if (typeof this.liveSession.close === 'function') {
                    this.liveSession.close();
                }
            } catch (error) {
                this.logger.error(
                    'Error disconnecting Live API session',
                    error,
                );
            }
        }

        this.liveSession = null;
        this.isConnected = false;
        this.audioResponseCallbacks = [];
        this.textResponseCallbacks = [];
    }

    /**
     * Build system instruction based on receptionist personality
     * This is where all the AI personality configuration happens
     */
    private buildSystemInstruction(
        personality: ReceptionistPersonality,
    ): string {
        const formalityLevel = this.getFormalityDescription(
            personality.levelFormality,
        );
        const dynamismLevel = this.getDynamismDescription(
            personality.levelDynamism,
        );

        let instruction = `You are ${personality.name}, a virtual receptionist assistant.

**Personality:**
- Formality Level: ${formalityLevel} (${personality.levelFormality}/10)
- Dynamism Level: ${dynamismLevel} (${personality.levelDynamism}/10)

**Your Role:**
You help clients with inquiries, appointments, and general information about the business.
`;

        if (personality.enterpriseInformation) {
            instruction += `\n**Business Information:**\n${personality.enterpriseInformation}\n`;
        }

        if (personality.clientInformation) {
            instruction += `\n**Client Handling Guidelines:**\n${personality.clientInformation}\n`;
        }

        if (personality.businessRestrictions) {
            instruction += `\n**Important Restrictions:**\n${personality.businessRestrictions}\n`;
        }

        instruction += `\nAlways maintain your personality traits while being helpful and professional.`;

        return instruction;
    }

    /**
     * Map formality level (1-10) to descriptive text
     */
    private getFormalityDescription(level: number): string {
        if (level <= 3) return 'Very casual and friendly';
        if (level <= 5) return 'Conversational and approachable';
        if (level <= 7) return 'Professional yet warm';
        if (level <= 9) return 'Formal and polished';
        return 'Highly formal and ceremonious';
    }

    /**
     * Map dynamism level (1-10) to descriptive text
     */
    private getDynamismDescription(level: number): string {
        if (level <= 3) return 'Calm and measured';
        if (level <= 5) return 'Balanced energy';
        if (level <= 7) return 'Energetic and engaging';
        if (level <= 9) return 'Very enthusiastic';
        return 'Highly dynamic and animated';
    }

    /**
     * Get current model configuration
     */
    getConfig() {
        return {
            model: this.modelName,
            ...this.config,
        };
    }
}
