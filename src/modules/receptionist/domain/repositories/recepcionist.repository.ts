import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { CreateReceptionistCommand } from '../commands/create-recepcionist.command';
import { ReceptionistEntity } from '../entities/receptionist.entity';

export const RECEPCIONIST_REPOSITORY = Symbol('RECEPCIONIST_REPOSITORY');

export interface ReceptionistRepository {
  create(params: CreateReceptionistCommand): Promise<ReceptionistEntity>;
  findOneById(id: string): Promise<ReceptionistEntity | null>;
  findAll(params: {
    enterpriseId: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<ReceptionistEntity>>;
  update(params: ReceptionistEntity): Promise<ReceptionistEntity>;
  delete(id: string): Promise<void>;
}
