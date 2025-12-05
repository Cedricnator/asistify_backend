import { Test, TestingModule } from '@nestjs/testing';
import { FindReceptionistByIdUseCase } from './find-receptionist-by-id.use-case';
import { RECEPCIONIST_REPOSITORY } from '../../../domain/repositories/recepcionist.repository';
import { ReceptionistEntity } from '../../../domain/entities/receptionist.entity';

describe('FindReceptionistByIdUseCase', () => {
  let useCase: FindReceptionistByIdUseCase;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindReceptionistByIdUseCase,
        {
          provide: RECEPCIONIST_REPOSITORY,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<FindReceptionistByIdUseCase>(
      FindReceptionistByIdUseCase,
    );
    repository = module.get(RECEPCIONIST_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a receptionist if found', async () => {
    const id = 'receptionist-id';
    const expectedReceptionist: ReceptionistEntity = {
      id,
      name: 'Test Receptionist',
    } as any;

    jest
      .spyOn(repository, 'findOneById')
      .mockResolvedValue(expectedReceptionist);

    const result = await useCase.execute(id);

    expect(result).toEqual(expectedReceptionist);
    expect(repository.findOneById).toHaveBeenCalledWith(id);
  });

  it('should throw an error if receptionist not found', async () => {
    const id = 'receptionist-id';
    jest.spyOn(repository, 'findOneById').mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toThrow(
      `Receptionist with ID ${id} not found`,
    );
    expect(repository.findOneById).toHaveBeenCalledWith(id);
  });
});
