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
  private generationCompleteCallbacks: (() => void)[] = [];
  private isConnected = false;
  private audioChunkCount = 0; // Track sent audio chunks

  constructor(private readonly configService: ConfigService) {
    // Load configuration on construction
    this.modelName =
      this.configService.get<string>('gemini.model') ??
      'gemini-2.0-flash-live-001';
    this.config = {
      temperature: this.configService.get<number>('gemini.temperature') ?? 1.0,
      maxOutputTokens:
        this.configService.get<number>('gemini.maxOutputTokens') ?? 8192,
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
   * Register a callback to be invoked when the Live API signals generation complete
   */
  onGenerationComplete(callback: () => void): void {
    this.generationCompleteCallbacks.push(callback);
  }

  /**
   * Initialize a session with receptionist personality
   * Returns THIS instance (self) as the ready-to-use session
   */
  async initializeSession(
    personality: ReceptionistPersonality,
    receptionistId: string,
  ): Promise<VoiceAgent> {
    this.logger.log(`Initializing Live API session for: ${personality.name}`);

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
          responseModalities: [Modality.AUDIO],
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          // Configure Voice Activity Detection for better turn detection
          // This helps Gemini know when the user has stopped speaking
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Aoede', // Professional female voice
              },
            },
          },
          tools: [
            {
              functionDeclarations: [
                {
                  name: 'bookAppointment',
                  description: 'Call this when the user wants to book an appointment.',
                },
              ],
            },
          ],
        },
        callbacks: {
          // Handle connection open
          onopen: () => {
            this.logger.log('Live API WebSocket connection opened');
          },
          // Handle incoming messages
          onmessage: async (response) => {
            // Debug: log the response structure
            this.logger.debug(
              `Received message with properties: setupComplete=${!!response.setupComplete}, serverContent=${!!response.serverContent}, text=${!!response.text}, data=${!!response.data}`,
            );

            // Handle setup complete
            if (response.setupComplete) {
              this.logger.log('Live API setup complete');
              return;
            }

            // Handle server content with model turns
            if (response.serverContent?.modelTurn) {
              const modelTurn = response.serverContent.modelTurn;
              if (modelTurn.parts) {
                for (const part of modelTurn.parts) {
                  // Handle inline audio data
                  if (part.inlineData?.data) {
                    const audioData = Buffer.from(
                      part.inlineData.data,
                      'base64',
                    );
                    this.logger.log(
                      `Received audio chunk: ${audioData.length} bytes (mimeType: ${part.inlineData.mimeType})`,
                    );
                    this.audioResponseCallbacks.forEach((callback) => {
                      callback(audioData);
                    });
                  }
                  // Handle text in parts
                  if (part.text) {
                    const textContent = part.text;
                    this.logger.log(`Received text: ${textContent}`);
                    this.textResponseCallbacks.forEach((callback) => {
                      callback(textContent);
                    });
                  }
                }
              }
            }

            // ServerContent Generation Complete Check
            if (response.serverContent?.generationComplete) {
              this.logger.log('Received Generated Complete Check');
              // Notify any listeners that generation has completed
              try {
                this.generationCompleteCallbacks.forEach(async (cb) => {
                  try {
                    await new Promise((resolve) => setTimeout(resolve, 4000));
                    cb();
                  } catch (e) {
                    this.logger.error(
                      'Error in generationComplete callback:',
                      e?.message || e,
                    );
                  }
                });
              } catch (e) {
                this.logger.error(
                  'Error notifying generationComplete callbacks:',
                  e?.message || e,
                );
              }
            }

            // Handle interruptions
            if (response.serverContent?.interrupted) {
              this.logger.log('Generation was interrupted');
            }

            // Handle text directly on the message (for TEXT modality)
            if (response.text) {
              const textContent = response.text;
              this.logger.log(`Received text: ${textContent}`);
              this.textResponseCallbacks.forEach((callback) => {
                callback(textContent);
              });
            }

            // Handle tool calls (function calling)
            if (response.toolCall) {
              this.logger.log(
                `Tool call received: ${JSON.stringify(response.toolCall)}`,
              );

              const functionCalls = response.toolCall.functionCalls;
              if (functionCalls && functionCalls.length > 0) {
                const toolResponses: any[] = [];

                for (const call of functionCalls) {
                  if (call.name === 'bookAppointment') {
                    this.logger.log('Executing tool: bookAppointment');
                    // Print that it has been called as requested
                    this.logger.log('*** BOOK APPOINTMENT TOOL CALLED ***');

                    toolResponses.push({
                      name: call.name,
                      response: { result: 'Appointment booking flow started' },
                      id: call.id,
                    });
                  }
                }

                // Send response back to the model to continue the conversation
                if (toolResponses.length > 0) {
                  this.liveSession.sendClientContent({
                    turns: [
                      {
                        role: 'user',
                        parts: toolResponses.map((tr) => ({
                          functionResponse: {
                            name: tr.name,
                            response: tr.response,
                            id: tr.id,
                          },
                        })),
                      },
                    ],
                    turnComplete: true,
                  });
                }
              }
            }

            // Handle usage metadata
            if (response.usageMetadata) {
              this.logger.debug(
                `Usage: ${JSON.stringify(response.usageMetadata)}`,
              );
            }

            // Log if we receive an empty/unknown response
            if (
              !response.setupComplete &&
              !response.serverContent &&
              !response.text &&
              !response.data &&
              !response.toolCall &&
              !response.usageMetadata
            ) {
              this.logger.warn(
                `Received unknown message type: ${JSON.stringify(response)}`,
              );
            }
          },
          // Handle errors
          onerror: (error) => {
            this.logger.error('Live API error:', error);
            this.logger.error('Error details:', JSON.stringify(error));
            this.isConnected = false;
          },
          // Handle connection close
          onclose: (event) => {
            this.logger.log('Live API session closed');
            if (event) {
              this.logger.log('Close event:', JSON.stringify(event));
            }
            this.isConnected = false;
          },
        },
      });

      this.isConnected = true;
      this.logger.log(`Connected to Live API for ${this.receptionistName}`);
    } catch (error) {
      this.logger.error('Error connecting to Live API', error);
      throw error;
    }
  }

  /**
   * Send audio data to Gemini Live API
   * @param audioBuffer - Audio data in 16-bit PCM, 16kHz, mono format
   */
  async sendAudio(
    audio: Buffer | { mimeType: string; data: string },
    turnComplete: boolean = false,
  ): Promise<void> {
    if (!this.liveSession || !this.isConnected) {
      throw new Error('Session not connected. Call connect() first.');
    }

    try {
      let mimeType = 'audio/pcm;rate=16000';
      let base64Audio: string;

      if (
        audio &&
        typeof audio === 'object' &&
        'data' in audio &&
        'mimeType' in audio
      ) {
        // Already a ready-to-send payload
        base64Audio = audio.data;
        mimeType = audio.mimeType;
      } else if (Buffer.isBuffer(audio)) {
        // Raw PCM buffer — convert to base64
        base64Audio = (audio as Buffer).toString('base64');
      } else {
        throw new Error('Unsupported audio payload');
      }

      // Use sendRealtimeInput() for streaming audio
      // The Live API will automatically handle VAD and respond when it detects end of speech
      // Log outgoing audio summary (not the full payload) to help debug transport/format issues
      try {
        const decoded = Buffer.from(base64Audio, 'base64');
        const preview = decoded
          .slice(0, Math.min(8, decoded.length))
          .toString('hex');
        this.logger.debug(
          `sendAudio -> mimeType=${mimeType} bytes=${decoded.length} preview=${preview}`,
        );
      } catch (err) {
        this.logger.debug(
          'sendAudio -> could not decode preview for logging',
          err?.message || err,
        );
      }

      this.liveSession.sendRealtimeInput({
        audio: {
          mimeType,
          data: base64Audio,
        },
      });

      // Only log every 50th chunk to reduce spam
      this.audioChunkCount++;
      if (this.audioChunkCount % 50 === 0) {
        this.logger.debug(
          `Sent ${this.audioChunkCount} audio chunks (mime=${mimeType})`,
        );
      }
    } catch (error) {
      this.logger.error('Error sending audio', error);
      this.logger.error('Error stack:', error.stack);
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
   * Force the Live API to treat the current client audio as a completed turn.
   * This sends an empty user turn with turnComplete=true which can be used
   * to force the model to generate a response when VAD doesn't trigger.
   */
  async forceEndTurn(): Promise<void> {
    if (!this.liveSession || !this.isConnected) {
      this.logger.warn('Cannot force end turn: session not connected');
      return;
    }

    try {
      // Send an empty user part but set turnComplete so the model will generate
      this.liveSession.sendClientContent({
        turns: [
          {
            role: 'user',
            parts: [{ text: '' }],
          },
        ],
        turnComplete: true,
      });
      this.logger.log('Forced turnComplete sent to Live API');
    } catch (err) {
      this.logger.error('Error forcing turnComplete:', err?.message || err);
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
        this.logger.error('Error disconnecting Live API session', error);
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
  private buildSystemInstruction(personality: ReceptionistPersonality): string {
    const formalityLevel = this.getFormalityDescription(
      personality.levelFormality,
    );
    const dynamismLevel = this.getDynamismDescription(
      personality.levelDynamism,
    );

    let instruction = `Eres ${personality.name}, debes repetir lo que te envíe en el mensaje.
        si no puedes entender el mensaje, responde con "Lo siento, no entendí eso. ¿Podrías repetirlo por favor?".

**Personalidad:**
- Nivel de Formalidad: ${formalityLevel} (${personality.levelFormality}/10)
- Nivel de Dinamismo: ${dynamismLevel} (${personality.levelDynamism}/10)

**IDIOMA Y ACENTO:**
- Usa una entonación natural
- Eres nativo del español
- Tienes un acento hispanohablante

**Tu Rol:**
Ayudas a los clientes con consultas, citas e información general sobre el negocio.
`;

    if (personality.enterpriseInformation) {
      instruction += `\n**Información del Negocio:**\n${personality.enterpriseInformation}\n`;
    }

    if (personality.clientInformation) {
      instruction += `\n**Pautas de Manejo de Clientes:**\n${personality.clientInformation}\n`;
    }

    if (personality.businessRestrictions) {
      instruction += `\n**Restricciones Importantes:**\n${personality.businessRestrictions}\n`;
    }

    instruction += `\nMantén siempre tus rasgos de personalidad mientras eres útil y profesional.`;

    return instruction;
  }

  /**
   * Map formality level (1-10) to descriptive text
   */
  private getFormalityDescription(level: number): string {
    if (level <= 3) return 'Muy casual y amigable';
    if (level <= 5) return 'Conversacional y accesible';
    if (level <= 7) return 'Profesional pero cálido';
    if (level <= 9) return 'Formal y pulido';
    return 'Altamente formal y ceremonioso';
  }

  /**
   * Map dynamism level (1-10) to descriptive text
   */
  private getDynamismDescription(level: number): string {
    if (level <= 3) return 'Calmado y mesurado';
    if (level <= 5) return 'Energía equilibrada';
    if (level <= 7) return 'Energético y atractivo';
    if (level <= 9) return 'Muy entusiasta';
    return 'Altamente dinámico y animado';
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
