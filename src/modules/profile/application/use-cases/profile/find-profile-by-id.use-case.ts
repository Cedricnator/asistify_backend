import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProfileEntity } from 'src/modules/profile/domain/entities/profile.entity';
import {
  PROFILE_REPOSITORY,
  type ProfileRepository,
} from 'src/modules/profile/domain/repositories/profile.repository';

@Injectable()
export class FindProfileByIdUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly repo: ProfileRepository,
  ) {}

  async execute(id: string): Promise<ProfileEntity> {
    const profile = await this.repo.findById(id);
    if (!profile) {
      throw new NotFoundException(`Profile with id: ${id} not found`);
    }
    return profile;
  }
}
