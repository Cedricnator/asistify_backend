import { Test, TestingModule } from '@nestjs/testing';
import { CountReceptionistUseCase } from './count-receptionist.use-case';
import { FindAllReceptionistsUseCase } from './find-all-receptionists.use-case';

describe('CountReceptionistUseCase', () => {
  let useCase: CountReceptionistUseCase;
  let findAllReceptionistsUseCase: FindAllReceptionistsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountReceptionistUseCase,
        {
          provide: FindAllReceptionistsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CountReceptionistUseCase>(CountReceptionistUseCase);
    findAllReceptionistsUseCase = module.get<FindAllReceptionistsUseCase>(
      FindAllReceptionistsUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return the count of receptionists', async () => {
    const enterpriseId = 'test-enterprise-id';
    const receptionists = { data: [{}, {}, {}], meta: {} } as any; // Mock data
    jest
      .spyOn(findAllReceptionistsUseCase, 'execute')
      .mockResolvedValue(receptionists);

    const result = await useCase.execute({ enterpriseId });

    expect(result).toBe(3);
    expect(findAllReceptionistsUseCase.execute).toHaveBeenCalledWith({
      enterpriseId,
    });
  });
});
