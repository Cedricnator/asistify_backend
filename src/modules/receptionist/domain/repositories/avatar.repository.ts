import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { CreateAvatarCommand } from '../commands/create-avatar.command';
import { AvatarEntity } from '../entities/avatar.entity';

export const AVATAR_REPOSITORY = Symbol('AVATAR_REPOSITORY');

export interface AvatarRepository {
  create(params: CreateAvatarCommand): Promise<AvatarEntity>;
  findOneById(id: string): Promise<AvatarEntity | null>;
  findAll(params: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<AvatarEntity>>;
  update(params: AvatarEntity): Promise<AvatarEntity>;
}
