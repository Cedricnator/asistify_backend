import { Inject, Injectable } from '@nestjs/common';
import { CreateReceptionistCommand } from '../../../domain/commands/create-recepcionist.command';
import { ReceptionistEntity } from '../../../domain/entities/receptionist.entity';
import {
  RECEPCIONIST_REPOSITORY,
  type ReceptionistRepository,
} from '../../../domain/repositories/recepcionist.repository';

@Injectable()
export class CreateReceptionistUseCase {
  constructor(
    @Inject(RECEPCIONIST_REPOSITORY)
    private readonly receptionistRepository: ReceptionistRepository,
  ) {}

  async execute(
    params: CreateReceptionistCommand,
  ): Promise<ReceptionistEntity> {
    return await this.receptionistRepository.create(params);
  }
}
