import { Inject, Injectable } from '@nestjs/common';
import { ReceptionistEntity } from '../../../domain/entities/receptionist.entity';
import {
  RECEPCIONIST_REPOSITORY,
  type ReceptionistRepository,
} from '../../../domain/repositories/recepcionist.repository';

@Injectable()
export class UpdateReceptionistUseCase {
  constructor(
    @Inject(RECEPCIONIST_REPOSITORY)
    private readonly receptionistRepository: ReceptionistRepository,
  ) {}

  async execute(params: ReceptionistEntity): Promise<ReceptionistEntity> {
    return await this.receptionistRepository.update(params);
  }
}
