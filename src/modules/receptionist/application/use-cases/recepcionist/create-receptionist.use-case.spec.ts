import { Test, TestingModule } from '@nestjs/testing';
import { CreateReceptionistUseCase } from './create-receptionist.use-case';
import { RECEPCIONIST_REPOSITORY } from '../../../domain/repositories/recepcionist.repository';
import { CreateReceptionistCommand } from '../../../domain/commands/create-recepcionist.command';
import { ReceptionistEntity } from '../../../domain/entities/receptionist.entity';

describe('CreateReceptionistUseCase', () => {
  let useCase: CreateReceptionistUseCase;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReceptionistUseCase,
        {
          provide: RECEPCIONIST_REPOSITORY,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateReceptionistUseCase>(CreateReceptionistUseCase);
    repository = module.get(RECEPCIONIST_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a receptionist', async () => {
    const command: CreateReceptionistCommand = {
      name: 'Test Receptionist',
      enterpriseId: 'enterprise-id',
      levelFormality: 5,
      levelDynamism: 5,
    } as any;
    const expectedReceptionist: ReceptionistEntity = {
      id: 'receptionist-id',
      ...command,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    jest.spyOn(repository, 'create').mockResolvedValue(expectedReceptionist);

    const result = await useCase.execute(command);

    expect(result).toEqual(expectedReceptionist);
    expect(repository.create).toHaveBeenCalledWith(command);
  });
});
