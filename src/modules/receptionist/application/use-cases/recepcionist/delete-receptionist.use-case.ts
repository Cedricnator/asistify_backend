import { Inject, Injectable } from '@nestjs/common';
import {
  RECEPCIONIST_REPOSITORY,
  type ReceptionistRepository,
} from '../../../domain/repositories/recepcionist.repository';

@Injectable()
export class DeleteReceptionistUseCase {
  constructor(
    @Inject(RECEPCIONIST_REPOSITORY)
    private readonly receptionistRepository: ReceptionistRepository,
  ) {}

  async execute(id: string): Promise<void> {
    return await this.receptionistRepository.delete(id);
  }
}
