import { Injectable, Logger } from '@nestjs/common';
import { AssistantManager } from '../../assistant/assistant-manager';
import { FindReceptionistByIdUseCase } from './find-receptionist-by-id.use-case';
import { ReceptionistPersonality } from '../../assistant/types/receptionist-personality';

@Injectable()
export class InitializeVoiceAssistantUseCase {
  private readonly logger = new Logger(InitializeVoiceAssistantUseCase.name);
  constructor(
    private readonly assistantManager: AssistantManager,
    private readonly findReceptionistByIdUseCase: FindReceptionistByIdUseCase,
  ) {}

  async execute(id: string) {
    this.logger.log(`Initializing voice assistant for receptionist: ${id}`);

    // Fetch the latest receptionist data from database
    const receptionist = await this.findReceptionistByIdUseCase.execute(id);

    // Prepare personality configuration
    const personality: ReceptionistPersonality = {
      name: receptionist.name,
      levelFormality: receptionist.levelFormality,
      levelDynamism: receptionist.levelDynamism,
      enterpriseInformation: receptionist.enterpriseInformation ?? '',
      clientInformation: receptionist.clientInformation ?? '',
      businessRestrictions: receptionist.businessRestrictions ?? '',
    };

    // Get VoiceAgent instance
    const voiceSession = await this.assistantManager.initializeVoiceSession(
      personality,
      receptionist.id,
    );

    this.logger.log(
      `Voice session ready for ${receptionist.name} - Formality: ${receptionist.levelFormality}/10, Dynamism: ${receptionist.levelDynamism}/10`,
    );

    // Return the VoiceAgent instance that Twilio can use directly
    return voiceSession;
  }
}
