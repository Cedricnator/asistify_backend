import { Test, TestingModule } from '@nestjs/testing';
import { DeleteReceptionistUseCase } from './delete-receptionist.use-case';
import { RECEPCIONIST_REPOSITORY } from '../../../domain/repositories/recepcionist.repository';

describe('DeleteReceptionistUseCase', () => {
  let useCase: DeleteReceptionistUseCase;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteReceptionistUseCase,
        {
          provide: RECEPCIONIST_REPOSITORY,
          useValue: {
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteReceptionistUseCase>(DeleteReceptionistUseCase);
    repository = module.get(RECEPCIONIST_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a receptionist', async () => {
    const id = 'receptionist-id';
    jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

    await useCase.execute(id);

    expect(repository.delete).toHaveBeenCalledWith(id);
  });
});
