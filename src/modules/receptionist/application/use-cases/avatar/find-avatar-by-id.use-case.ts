import { Inject, Injectable } from '@nestjs/common';
import { AvatarEntity } from '../../../domain/entities/avatar.entity';
import {
  AVATAR_REPOSITORY,
  type AvatarRepository,
} from '../../../domain/repositories/avatar.repository';

@Injectable()
export class FindAvatarByIdUseCase {
  constructor(
    @Inject(AVATAR_REPOSITORY)
    private readonly avatarRepository: AvatarRepository,
  ) {}

  async execute(id: string): Promise<AvatarEntity | null> {
    return await this.avatarRepository.findOneById(id);
  }
}
