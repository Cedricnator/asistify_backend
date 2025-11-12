import { Inject, Injectable } from '@nestjs/common';
import { ReceptionistEntity } from '../../../domain/entities/receptionist.entity';
import {
  RECEPCIONIST_REPOSITORY,
  type ReceptionistRepository,
} from '../../../domain/repositories/recepcionist.repository';

@Injectable()
export class FindReceptionistByIdUseCase {
  constructor(
    @Inject(RECEPCIONIST_REPOSITORY)
    private readonly receptionistRepository: ReceptionistRepository,
  ) {}

  async execute(id: string): Promise<ReceptionistEntity> {
    const receptionsit = await this.receptionistRepository.findOneById(id);
    if (!receptionsit) {
      throw new Error(`Receptionist with ID ${id} not found`);
    }
    return receptionsit;
  }
}
