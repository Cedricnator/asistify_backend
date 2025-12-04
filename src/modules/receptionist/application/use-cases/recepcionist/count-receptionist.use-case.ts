import { Injectable } from '@nestjs/common';
import { FindAllReceptionistsUseCase } from './find-all-receptionists.use-case';

@Injectable()
export class CountReceptionistUseCase {
  constructor(
    private readonly findAllReceptionistsUseCase: FindAllReceptionistsUseCase,
  ) {}

  async execute(params: { enterpriseId: string }): Promise<number> {
    const receptionists = await this.findAllReceptionistsUseCase.execute({
      enterpriseId: params.enterpriseId,
    });
    return receptionists.data.length;
  }
}
