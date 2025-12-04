import { Inject, Injectable } from '@nestjs/common';
import {
  RECEPCIONIST_REPOSITORY,
  type ReceptionistRepository,
} from '../../../domain/repositories/recepcionist.repository';
import { FindAllReceptionistsUseCase } from './find-all-receptionists.use-case';

@Injectable()
export class CountReceptionistUseCase {
  constructor(
    @Inject(RECEPCIONIST_REPOSITORY)
    private readonly receptionistRepository: ReceptionistRepository,
    private readonly findAllReceptionistsUseCase: FindAllReceptionistsUseCase,
  ) {}

  async execute(params: { enterpriseId: string }): Promise<number> {
    const receptionists = await this.findAllReceptionistsUseCase.execute({
      enterpriseId: params.enterpriseId,
    });
    return receptionists.data.length;
  }
}
