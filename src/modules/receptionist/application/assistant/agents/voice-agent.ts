import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { ReceptionistPersonality } from '../types/receptionist-personality';
import { CreateDateUseCase } from '../../../../calendar/application/use-cases/create-date.use-case';
import { RetrivalService } from '../../../../chunks/application/services/retrival.service';
import { CalendarEventState } from '../../../domain/enums/calendar.enums';

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
  private calendarId?: string;
  private receptionistName: string;
  private personality: ReceptionistPersonality;
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

  constructor(
    private readonly configService: ConfigService,
    private readonly createDateUseCase: CreateDateUseCase,
    private readonly retrivalService: RetrivalService,
  ) {
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
    calendarId?: string,
  ): Promise<VoiceAgent> {
    this.logger.warn(
      `Initializing Live API session for: PERSONALITY: ${personality.name}, Receptionist ID: ${receptionistId}, Calendar ID: ${calendarId}`,
    );

    if (!this.genAI) {
      throw new Error(
        'Voice agent not initialized. Check your Gemini API key.',
      );
    }

    // Store receptionist info in this instance
    this.receptionistId = receptionistId;
    this.calendarId = calendarId;
    this.receptionistName = personality.name;
    this.personality = personality;

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
  async connect(): Promise<void> {
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
      const systemInstruction = this.buildSystemInstruction(this.personality);

      this.logger.log(`System instruction built: ${systemInstruction}`);

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
                // Opciones: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'
                voiceName: 'Aoede', // Optimistic voice - works better for Spanish
              },
            },
          },
          tools: [
            {
              functionDeclarations: [
                {
                  name: 'bookAppointment',
                  description:
                    'Call this when the user wants to book an appointment. Ask for the client name, date, time, and duration.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      clientName: {
                        type: Type.STRING,
                        description:
                          'Name of the client booking the appointment',
                      },
                      datetime: {
                        type: Type.STRING,
                        description:
                          'Date and time of the appointment in ISO 8601 format (e.g., 2025-10-27T10:00:00)',
                      },
                      duration: {
                        type: Type.NUMBER,
                        description: 'Duration of the appointment in minutes',
                      },
                    },
                    required: ['clientName', 'datetime', 'duration'],
                  },
                },
                {
                  name: 'searchKnowledge',
                  description:
                    'Search the company knowledge base (RAG) for specific information about the business, products, services, policies, or procedures. Use this when the user asks detailed questions about the company that are not covered in your general instructions.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      query: {
                        type: Type.STRING,
                        description:
                          'The search query to find relevant information in the knowledge base. Be specific and clear.',
                      },
                    },
                    required: ['query'],
                  },
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
              this.logger.log(
                'Live API setup complete - Sending Spanish priming message',
              );
              // CRITICAL: Send immediate Spanish message to force Spanish accent/language
              // This is a workaround for Gemini Live API language detection issues
              this.liveSession.sendClientContent({
                turns: [
                  {
                    role: 'user',
                    parts: [{ text: '¡Hola! Habla en español por favor.' }],
                  },
                ],
                turnComplete: true,
              });
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
                    this.logger.log(`Args: ${JSON.stringify(call.args)}`);

                    this.logger.log('Calendar ID: ' + this.calendarId);
                    this.logger.log('Receptionist ID: ' + this.receptionistId);

                    try {
                      if (!this.calendarId) {
                        throw new Error(
                          'Calendar ID not configured for this receptionist.',
                        );
                      }

                      const args = call.args as any;
                      // Append Z to treat as UTC, preventing server timezone shift
                      const start = new Date(
                        args.datetime.endsWith('Z')
                          ? args.datetime
                          : `${args.datetime}Z`,
                      );
                      const duration = args.duration || 30; // default 30 mins
                      const end = new Date(start.getTime() + duration * 60000);

                      this.logger.log(
                        `Creating event: ${args.clientName} at ${start.toISOString()} for ${duration} mins`,
                      );

                      const event = await this.createDateUseCase.execute({
                        calendarId: this.calendarId,
                        name: `Cita: ${args.clientName} + " ${CalendarEventState.PENDING}"`,
                        startDatetime: start,
                        endDatetime: end,
                        timezone: 'America/Santiago', // Default or fetch from config
                      });

                      this.logger.log(`Event created: ${event.eventId}`);

                      toolResponses.push({
                        name: call.name,
                        response: {
                          result: 'success',
                          message: `Appointment booked for ${args.clientName} at ${start.toLocaleString()}`,
                          eventId: event.eventId,
                          // eventId: 'mock-event-id',
                        },
                        id: call.id,
                      });
                    } catch (error) {
                      this.logger.error(`Error booking appointment: ${error}`);
                      toolResponses.push({
                        name: call.name,
                        response: {
                          result: 'error',
                          message: `Failed to book appointment: ${error.message}`,
                        },
                        id: call.id,
                      });
                    }
                  } else if (call.name === 'searchKnowledge') {
                    this.logger.log('Executing tool: searchKnowledge');
                    this.logger.log(`Args: ${JSON.stringify(call.args)}`);

                    try {
                      const args = call.args as any;
                      const query = args.query;

                      if (!query || query.trim() === '') {
                        throw new Error('Query cannot be empty');
                      }

                      // Get enterprise ID from receptionist (assuming it's available)
                      // If documents are filtered by enterprise, you may need to pass enterpriseId
                      const retrievalResult =
                        await this.retrivalService.retrieve({
                          query,
                          matchThreshold: 0.7,
                          matchCount: 5,
                          useQueryRewrite: false,
                        });

                      if (retrievalResult.chunks.length === 0) {
                        // No information found in RAG
                        toolResponses.push({
                          name: call.name,
                          response: {
                            result: 'not_found',
                            message:
                              'No tengo esa información en mi base de conocimiento.',
                          },
                          id: call.id,
                        });
                      } else {
                        // Build context from chunks
                        const context = retrievalResult.chunks
                          .map((chunk) => chunk.content)
                          .join('\n\n');

                        this.logger.log(
                          `Found ${retrievalResult.chunks.length} relevant chunks for query: "${query}"`,
                        );

                        toolResponses.push({
                          name: call.name,
                          response: {
                            result: 'success',
                            information: context,
                            totalResults: retrievalResult.totalResults,
                          },
                          id: call.id,
                        });
                      }
                    } catch (error) {
                      this.logger.error(
                        `Error searching knowledge base: ${error.message}`,
                        error.stack,
                      );
                      // Return "I don't know" response on error
                      toolResponses.push({
                        name: call.name,
                        response: {
                          result: 'error',
                          message:
                            'No tengo esa información en mi base de conocimiento.',
                        },
                        id: call.id,
                      });
                    }
                  }
                }

                // Send response back to the model to continue the conversation
                if (toolResponses.length > 0) {
                  this.liveSession.sendToolResponse({
                    functionResponses: toolResponses.map((tr) => ({
                      name: tr.name,
                      response: tr.response,
                      id: tr.id,
                    })),
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
        // this.logger.debug(
        //   `sendAudio -> mimeType=${mimeType} bytes=${decoded.length} preview=${preview}`,
        // );
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

    // Generate specific style guidelines based on levels
    let styleGuide = '';

    // Formality Logic
    if (personality.levelFormality <= 1) {
      styleGuide += '- Tira bromas en cada una de tus frases\n';
      styleGuide +=
        '- Habla como si fueras un amigo cercano, usando jerga y modismos chilenos.\n';
      styleGuide += '- Puedes reír.\n';
    } else if (personality.levelFormality <= 4) {
      styleGuide +=
        "- Trata al usuario de 'tú'. Usa un lenguaje cercano, coloquial y amigable.\n";
      styleGuide += '- Puedes usar expresiones informales pero respetuosas.\n';
    } else if (personality.levelFormality <= 7) {
      styleGuide +=
        "- Trata al usuario de 'usted' por defecto, pero sé cercano.\n";
      styleGuide += '- Mantén un equilibrio entre profesionalismo y calidez.\n';
    } else {
      styleGuide += "- Trata al usuario estrictamente de 'usted'.\n";
      styleGuide += '- Usa un vocabulario elegante, preciso y muy cortés.\n';
    }

    // Dynamism Logic
    if (personality.levelDynamism <= 4) {
      styleGuide +=
        '- Mantén un tono calmado, pausado y sereno. Transmite paz.\n';
      styleGuide += '- Evita exclamaciones excesivas o hablar muy rápido.\n';
    } else if (personality.levelDynamism <= 7) {
      styleGuide +=
        '- Muestra interés y energía positiva, pero sin exagerar.\n';
      styleGuide += '- Tu ritmo debe ser fluido y activo.\n';
    } else {
      styleGuide +=
        '- ¡Sé muy entusiasta y enérgico! Transmite mucha emoción.\n';
      styleGuide +=
        '- Usa un ritmo rápido y dinámico. ¡Que se note tu energía!\n';
    }

    const date = new Date().toLocaleString('es-ES', {
      timeZone: 'America/Santiago',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    const currentYear = new Date().getFullYear();

    this.logger.log(
      `Building system instruction for ${personality.name} on ${date}`,
    );

    let instruction = `
    !!! INSTRUCCIÓN CRÍTICA DE IDIOMA Y VOZ !!!
    TU IDIOMA PRINCIPAL Y ÚNICO ES EL ESPAÑOL.
    - Debes hablar SIEMPRE en español latinoamericano (Chile/región Andina).
    - Usa un ACENTO NATIVO ESPAÑOL, con pronunciación clara y natural de hablante nativo chileno.
    - NUNCA generes texto en inglés, ni siquiera frases cortas como "Hello" o "Okay". Usa "Hola" o "Entendido".
    - Tu ENTONACIÓN debe ser la de un hispanohablante nativo, no traducción desde inglés.
    - Ejemplos de cómo debes hablar: "¡Buenos días! ¿En qué puedo ayudarle?", "Perfecto, déjeme agendar eso para usted", "¿Me podría confirmar su nombre, por favor?"
    
    Eres ${personality.name}, un recepcionista profesional chileno.
    
    IMPORTANTE: Habla con acento español natural desde tu primera palabra. No uses acento inglés.

**Personalidad:**
- Nivel de Formalidad: ${formalityLevel} (${personality.levelFormality}/10)
- Nivel de Dinamismo: ${dynamismLevel} (${personality.levelDynamism}/10)

**GUÍA DE ESTILO Y TONO (CRÍTICO):**
${styleGuide}

**IDIOMA, ACENTO Y ESTILO DE VOZ:**
- Habla con ACENTO ESPAÑOL LATINOAMERICANO (Chilean Spanish). 
- Pronunciación: Clara, natural, como un chileno nativo.
- Entonación: Auténtica, no robótica ni traducida del inglés.
- Ritmo: Natural y conversacional en español.
- Sé conciso. Respuestas cortas son mejores para voz.

**Tu Rol:**
Gestionar citas y consultas. Tu objetivo principal es agendar citas correctamente usando la herramienta \`bookAppointment\`.

**HERRAMIENTAS DISPONIBLES:**
1. **bookAppointment**: Agendar citas para clientes.
2. **searchKnowledge**: Buscar información específica sobre la empresa en la base de conocimientos.
   - Úsala cuando el usuario pregunte por: productos, servicios, políticas, procedimientos, precios, horarios, ubicaciones, etc.
   - Si la herramienta devuelve "not_found" o "error", responde: "Disculpe, no tengo esa información disponible en este momento."
   - NUNCA inventes información que no esté en la base de conocimientos o en tus instrucciones generales.

**Fecha Actual:** ${date}
**Año Actual:** ${currentYear}

**REGLAS DE RAZONAMIENTO:**
Antes de responder o llamar a una herramienta, PIENSA PASO A PASO en silencio:
NUNCA debes pensar en voz alta ni compartir tu razonamiento con el usuario. Solo piensa internamente.
1. **Analizar Intención:** ¿El usuario quiere agendar, cancelar o solo preguntar?
2. **Verificar Datos:** Si quiere agendar, ¿tengo Nombre, Fecha/Hora y Duración?
3. **Validar Fecha:**
   - ¿La fecha es en el pasado? (Rechazar).
   - ¿El año es anterior a ${currentYear}? (Corregir al usuario).
   - Si dice "lunes", calcula la fecha exacta basada en la **Fecha Actual**.
4. **Decisión:**
   - Si falta información -> Pregunta por el dato faltante.
   - Si la fecha es errónea -> Aclara el error.
   - Debes SIEMPRE confirmar con el usuario antes de agendar.
   - Si todo está bien -> Llama a \`bookAppointment\`.

**EJEMPLOS DE INTERACCIÓN:**

**Ejemplo 1: Flujo Ideal**
Usuario: "Hola, quiero agendar una cita."
Asistente (Pensamiento): "Intención: Agendar. Faltan datos: Nombre, Fecha, Duración."
Asistente: "Claro, ¿me podría dar su nombre y para cuándo le gustaría la cita?"
Usuario: "Soy Carlos, para mañana a las 3 de la tarde por media hora."
Asistente (Pensamiento): "Datos: Carlos, Mañana 3pm, 30 min. Fecha válida. Procedo."
Asistente: (Llama a tool bookAppointment) "Listo Carlos, agendando para mañana a las 3pm."

**Ejemplo 2: Validación de Año**
Usuario: "Quiero cita para el 10 de octubre de 2023."
Asistente (Pensamiento): "Año solicitado: 2023. Año actual: ${currentYear}. Es pasado."
Asistente: "Disculpe, el año 2023 ya pasó. ¿Se refiere a este año o al próximo?"

**Ejemplo 3: Datos Faltantes**
Usuario: "Necesito una cita para el viernes."
Asistente (Pensamiento): "Falta hora, duración y nombre. Preguntaré lo más importante primero."
Asistente: "¿A qué hora le gustaría el viernes y cuál es su nombre?"

**Ejemplo 4: Ambigüedad**
Usuario: "Resérvame."
Asistente (Pensamiento): "Intención clara, pero faltan todos los detalles."
Asistente: "Con gusto. ¿Para qué día y hora, y a nombre de quién?"

**Ejemplo 5: Confirmación Implícita**
Usuario: "Soy Ana, el martes a las 10am, una hora."
Asistente (Pensamiento): "Tengo todo. Ana, Martes próximo 10am, 60 min. Validando fecha... Correcto."
Asistente: (Llama a tool bookAppointment) "Perfecto Ana, queda agendado para el martes a las 10."

**Ejemplo 6: Consulta sobre la Empresa**
Usuario: "¿Cuál es el horario de atención?"
Asistente (Pensamiento): "El usuario pregunta por información específica de la empresa. Debo usar searchKnowledge."
Asistente: (Llama a tool searchKnowledge con query: "horario de atención") 
[Si encuentra]: "Nuestro horario es de lunes a viernes de 9am a 6pm."
[Si no encuentra]: "Disculpe, no tengo esa información disponible en este momento."

**Instrucciones Finales:**
- NO inventes fechas.
- Si el usuario no especifica duración, asume 30 minutos pero confírmalo.
- Sé amable pero eficiente.
- Usa searchKnowledge para consultas específicas sobre la empresa.
- Si searchKnowledge no encuentra resultados, NUNCA inventes información.
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
