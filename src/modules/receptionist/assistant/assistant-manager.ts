import { Injectable, Logger } from '@nestjs/common';
import { VoiceAgent } from './agents/voice-agent';
import { ReceptionistPersonality } from './types/receptionist-personality';

/**
 * AssistantManager - Orchestrator for AI agents
 *
 * This class acts as a coordinator between different AI agents (voice, embeddings, etc.)
 */
@Injectable()
export class AssistantManager {
    private readonly logger = new Logger(AssistantManager.name);

    constructor(private readonly voiceAgent: VoiceAgent) {}

    /**
     * Initialize a voice session - delegates to VoiceAgent
     * Returns the VoiceAgent instance as a ready-to-use session
     */
    async initializeVoiceSession(
        personality: ReceptionistPersonality,
        receptionistId: string,
    ) {
        this.logger.log(
            `Orchestrating voice session initialization for: ${personality.name}`,
        );

        return await this.voiceAgent.initializeSession(
            personality,
            receptionistId,
        );
    }

    /**
     * Future: Handle embeddings for RAG/semantic search
     * async generateEmbeddings(text: string) {
     *   return await this.embeddingsAgent.generate(text);
     * }
     */

    /**
     * Future: Handle other AI operations
     * async analyzeSentiment(text: string) {
     *   return await this.sentimentAgent.analyze(text);
     * }
     */
}
