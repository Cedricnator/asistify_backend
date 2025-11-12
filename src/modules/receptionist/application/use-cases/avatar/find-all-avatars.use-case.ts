import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { AvatarEntity } from '../../../domain/entities/avatar.entity';
import {
  AVATAR_REPOSITORY,
  type AvatarRepository,
} from '../../../domain/repositories/avatar.repository';

@Injectable()
export class FindAllAvatarsUseCase {
  constructor(
    @Inject(AVATAR_REPOSITORY)
    private readonly avatarRepository: AvatarRepository,
  ) {}

  async execute(params: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<AvatarEntity>> {
    return await this.avatarRepository.findAll(params);
  }
}
