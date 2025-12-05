import { Test, TestingModule } from '@nestjs/testing';
import { FindAllReceptionistsUseCase } from './find-all-receptionists.use-case';
import { RECEPCIONIST_REPOSITORY } from '../../../domain/repositories/recepcionist.repository';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { ReceptionistEntity } from '../../../domain/entities/receptionist.entity';

describe('FindAllReceptionistsUseCase', () => {
  let useCase: FindAllReceptionistsUseCase;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllReceptionistsUseCase,
        {
          provide: RECEPCIONIST_REPOSITORY,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<FindAllReceptionistsUseCase>(
      FindAllReceptionistsUseCase,
    );
    repository = module.get(RECEPCIONIST_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all receptionists', async () => {
    const params = { enterpriseId: 'enterprise-id' };
    const expectedResponse: PaginatedResponseDto<ReceptionistEntity> = {
      data: [],
      meta: {
        total: 0,
        page: 1,
        lastPage: 1,
      },
    };

    jest.spyOn(repository, 'findAll').mockResolvedValue(expectedResponse);

    const result = await useCase.execute(params);

    expect(result).toEqual(expectedResponse);
    expect(repository.findAll).toHaveBeenCalledWith(params);
  });
});
