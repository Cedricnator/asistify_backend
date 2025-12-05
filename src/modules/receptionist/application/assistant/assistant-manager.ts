import { Injectable, Logger } from '@nestjs/common';
import { VoiceAgent } from './agents/voice-agent';
import { ReceptionistPersonality } from './types/receptionist-personality';
import { FindReceptionistByIdUseCase } from '../use-cases/recepcionist/find-receptionist-by-id.use-case';
import { FindEnterpriseByIdUseCase } from '../../../enterprise/application/use-cases/enterprise/find-enterprise-by-id.use-case';

/**
 * AssistantManager - Orchestrator for AI agents
 *
 * This class acts as a coordinator between different AI agents (voice, embeddings, etc.)
 */
@Injectable()
export class AssistantManager {
  private readonly logger = new Logger(AssistantManager.name);

  constructor(
    private readonly voiceAgent: VoiceAgent,
    private readonly findReceptionistByIdUseCase: FindReceptionistByIdUseCase,
    private readonly findEnterpriseByIdUseCase: FindEnterpriseByIdUseCase,
  ) {}

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

    // Fetch receptionist to get enterpriseId
    this.logger.log(`Fetching receptionist: ${receptionistId}`);
    const receptionist =
      await this.findReceptionistByIdUseCase.execute(receptionistId);
    if (!receptionist) {
      throw new Error(`Receptionist not found: ${receptionistId}`);
    }
    this.logger.log(`Receptionist found: ${receptionist.id}`);

    // Fetch enterprise to get calendarId
    this.logger.log(`Fetching enterprise: ${receptionist.enterpriseId}`);
    const enterprise = await this.findEnterpriseByIdUseCase.execute(
      receptionist.enterpriseId,
    );
    if (!enterprise) {
      throw new Error(`Enterprise not found: ${receptionist.enterpriseId}`);
    }
    this.logger.warn(`Enterprise found: ${enterprise.id}`);

    const calendarId = enterprise.calendarId;
    this.logger.warn(`Calendar ID found: ${calendarId}`);
    if (!calendarId) {
      this.logger.warn(
        `No calendar ID found for enterprise ${enterprise.id}. Booking will not work.`,
      );
    }

    const receptionistPersonality: ReceptionistPersonality = {
      name: receptionist.name,
      levelFormality: receptionist.levelFormality,
      levelDynamism: receptionist.levelDynamism,
      enterpriseInformation: receptionist.enterpriseInformation!,
      clientInformation: receptionist.clientInformation!,
      businessRestrictions: receptionist.businessRestrictions!,
    }

    this.logger.debug('Initializing voice session... with calendarId: ', calendarId);
    return await this.voiceAgent.initializeSession(
      receptionistPersonality,
      receptionistId,
      calendarId || undefined,
    );
  }
}
