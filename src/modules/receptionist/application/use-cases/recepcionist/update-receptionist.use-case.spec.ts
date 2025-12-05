import { Test, TestingModule } from '@nestjs/testing';
import { UpdateReceptionistUseCase } from './update-receptionist.use-case';
import { RECEPCIONIST_REPOSITORY } from '../../../domain/repositories/recepcionist.repository';
import { ReceptionistEntity } from '../../../domain/entities/receptionist.entity';

describe('UpdateReceptionistUseCase', () => {
  let useCase: UpdateReceptionistUseCase;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateReceptionistUseCase,
        {
          provide: RECEPCIONIST_REPOSITORY,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateReceptionistUseCase>(UpdateReceptionistUseCase);
    repository = module.get(RECEPCIONIST_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a receptionist', async () => {
    const receptionist: ReceptionistEntity = {
      id: 'receptionist-id',
      name: 'Updated Receptionist',
    } as any;

    jest.spyOn(repository, 'update').mockResolvedValue(receptionist);

    const result = await useCase.execute(receptionist);

    expect(result).toEqual(receptionist);
    expect(repository.update).toHaveBeenCalledWith(receptionist);
  });
});
