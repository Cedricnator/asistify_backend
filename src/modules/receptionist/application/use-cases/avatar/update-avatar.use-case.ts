import { Inject, Injectable } from '@nestjs/common';
import { AvatarEntity } from '../../../domain/entities/avatar.entity';
import {
  AVATAR_REPOSITORY,
  type AvatarRepository,
} from '../../../domain/repositories/avatar.repository';

@Injectable()
export class UpdateAvatarUseCase {
  constructor(
    @Inject(AVATAR_REPOSITORY)
    private readonly avatarRepository: AvatarRepository,
  ) {}

  async execute(params: AvatarEntity): Promise<AvatarEntity> {
    return await this.avatarRepository.update(params);
  }
}
