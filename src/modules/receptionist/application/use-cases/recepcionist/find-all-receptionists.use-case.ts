import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { ReceptionistEntity } from '../../../domain/entities/receptionist.entity';
import {
  RECEPCIONIST_REPOSITORY,
  type ReceptionistRepository,
} from '../../../domain/repositories/recepcionist.repository';

@Injectable()
export class FindAllReceptionistsUseCase {
  constructor(
    @Inject(RECEPCIONIST_REPOSITORY)
    private readonly receptionistRepository: ReceptionistRepository,
  ) {}

  async execute(params: {
    enterpriseId: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<ReceptionistEntity>> {
    return await this.receptionistRepository.findAll(params);
  }
}
