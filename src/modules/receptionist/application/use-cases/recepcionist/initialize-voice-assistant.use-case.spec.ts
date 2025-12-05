import { Test, TestingModule } from '@nestjs/testing';
import { InitializeVoiceAssistantUseCase } from './initialize-voice-assistant.use-case';
import { AssistantManager } from '../../assistant/assistant-manager';
import { FindReceptionistByIdUseCase } from './find-receptionist-by-id.use-case';
import { ReceptionistEntity } from '../../../domain/entities/receptionist.entity';

describe('InitializeVoiceAssistantUseCase', () => {
  let useCase: InitializeVoiceAssistantUseCase;
  let assistantManager: any;
  let findReceptionistByIdUseCase: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InitializeVoiceAssistantUseCase,
        {
          provide: AssistantManager,
          useValue: {
            initializeVoiceSession: jest.fn(),
          },
        },
        {
          provide: FindReceptionistByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<InitializeVoiceAssistantUseCase>(
      InitializeVoiceAssistantUseCase,
    );
    assistantManager = module.get(AssistantManager);
    findReceptionistByIdUseCase = module.get(FindReceptionistByIdUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should initialize voice assistant', async () => {
    const id = 'receptionist-id';
    const receptionist: ReceptionistEntity = {
      id,
      name: 'Test Receptionist',
      levelFormality: 5,
      levelDynamism: 5,
      enterpriseInformation: 'info',
      clientInformation: 'client info',
      businessRestrictions: 'restrictions',
    } as any;
    const voiceSession = { sessionId: 'session-id' };

    jest
      .spyOn(findReceptionistByIdUseCase, 'execute')
      .mockResolvedValue(receptionist);
    jest
      .spyOn(assistantManager, 'initializeVoiceSession')
      .mockResolvedValue(voiceSession);

    const result = await useCase.execute(id);

    expect(result).toEqual(voiceSession);
    expect(findReceptionistByIdUseCase.execute).toHaveBeenCalledWith(id);
    expect(assistantManager.initializeVoiceSession).toHaveBeenCalledWith(
      expect.objectContaining({
        name: receptionist.name,
        levelFormality: receptionist.levelFormality,
      }),
      receptionist.id,
    );
  });
});
