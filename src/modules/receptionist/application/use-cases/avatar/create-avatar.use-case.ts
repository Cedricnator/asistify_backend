import { Inject, Injectable } from '@nestjs/common';
import { CreateAvatarCommand } from '../../../domain/commands/create-avatar.command';
import { AvatarEntity } from '../../../domain/entities/avatar.entity';
import {
  AVATAR_REPOSITORY,
  type AvatarRepository,
} from '../../../domain/repositories/avatar.repository';

@Injectable()
export class CreateAvatarUseCase {
  constructor(
    @Inject(AVATAR_REPOSITORY)
    private readonly avatarRepository: AvatarRepository,
  ) {}

  async execute(params: CreateAvatarCommand): Promise<AvatarEntity> {
    return await this.avatarRepository.create(params);
  }
}
