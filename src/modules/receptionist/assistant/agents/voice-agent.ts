import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ReceptionistPersonality } from '../types/receptionist-personality';

/**
 * VoiceAgent - Gemini AI integration for voice-based interactions
 *
 * This service IS the session. Each instance represents an active voice session.
 *
 * Usage:
 * ```typescript
 * const voiceSession = await voiceAgent.initializeSession(personality, receptionistId);
 * const response = await voiceSession.handleVoiceInteraction(userMessage);
 * ```
 *
 * This service handles all AI logic including:
 * - System prompt generation based on personality
 * - Session management
 * - Response generation
 * - Personality trait interpretation
 *
 * Configuration (via .env):
 * - GEMINI_API_KEY: Your Google AI API key (required)
 * - GEMINI_MODEL: Model name (default: gemini-2.0-flash-exp)
 * - GEMINI_TEMPERATURE: Creativity level 0-2 (default: 1.0)
 * - GEMINI_MAX_OUTPUT_TOKENS: Max response length (default: 8192)
 * - GEMINI_TOP_P: Nucleus sampling (default: 0.95)
 * - GEMINI_TOP_K: Top-k sampling (default: 40)
 */
@Injectable({ scope: Scope.TRANSIENT })
export class VoiceAgent implements OnModuleInit {
    private readonly logger = new Logger(VoiceAgent.name);
    private genAI: GoogleGenAI;
    private chatSession: any; // Gemini chat session
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

    constructor(private readonly configService: ConfigService) {
        // Load configuration on construction
        this.modelName =
            this.configService.get<string>('gemini.model') ??
            'gemini-2.0-flash-exp';
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
                `Voice agent initialized with model: ${this.modelName}`,
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
        this.logger.log(`Initializing voice session for: ${personality.name}`);

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

        // Build system instruction based on personality
        const systemInstruction = this.buildSystemInstruction(personality);

        try {
            // Create and store the chat session
            this.chatSession = await this.genAI.chats.create({
                model: this.modelName,
                config: {
                    temperature: this.config.temperature,
                    maxOutputTokens: this.config.maxOutputTokens,
                    topP: this.config.topP,
                    topK: this.config.topK,
                    systemInstruction,
                },
            });

            this.logger.log(
                `Session initialized for ${personality.name} - Formality: ${personality.levelFormality}/10, Dynamism: ${personality.levelDynamism}/10`,
            );

            // Return this instance as the session
            return this;
        } catch (error) {
            this.logger.error('Error initializing session', error);
            throw error;
        }
    }

    /**
     * Handle voice interaction - main method for Twilio to call
     * @param userMessage - The user's speech transcribed to text
     * @returns AI-generated response
     */
    async handleVoiceInteraction(userMessage: string): Promise<string> {
        if (!this.chatSession) {
            throw new Error(
                'Session not initialized. Call initializeSession() first.',
            );
        }

        this.logger.log(`Processing message for ${this.receptionistName}`);

        try {
            const result = await this.chatSession.sendMessage(userMessage);
            const response = result.text || '';

            this.logger.log(`Generated response (${response.length} chars)`);
            return response;
        } catch (error) {
            this.logger.error('Error in voice interaction', error);
            throw error;
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
     * Get chat history
     */
    async getHistory() {
        if (!this.chatSession) {
            throw new Error('Session not initialized');
        }

        try {
            return await this.chatSession.getHistory();
        } catch (error) {
            this.logger.error('Error getting chat history', error);
            throw error;
        }
    }

    /**
     * End the session
     */
    async endSession() {
        this.logger.log(`Ending session for ${this.receptionistName}`);
        this.chatSession = null;
    }

    /**
     * Generate a response from the voice agent
     */
    async generateResponse(prompt: string): Promise<string> {
        if (!this.genAI) {
            throw new Error(
                'Voice agent not initialized. Check your Gemini API key.',
            );
        }

        try {
            const response = await this.genAI.models.generateContent({
                model: this.modelName,
                contents: prompt,
                config: {
                    temperature: this.config.temperature,
                    maxOutputTokens: this.config.maxOutputTokens,
                    topP: this.config.topP,
                    topK: this.config.topK,
                },
            });

            return response.text || '';
        } catch (error) {
            this.logger.error('Error generating response', error);
            throw error;
        }
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
