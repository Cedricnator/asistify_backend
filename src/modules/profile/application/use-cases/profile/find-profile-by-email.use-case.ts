import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProfileEntity } from 'src/modules/profile/domain/entities/profile.entity';
import {
  PROFILE_REPOSITORY,
  type ProfileRepository,
} from 'src/modules/profile/domain/repositories/profile.repository';

@Injectable()
export class FindProfileByEmailUseCase {
  private readonly logger = new Logger(FindProfileByEmailUseCase.name);

  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly repository: ProfileRepository,
  ) {}

  async execute(email: string): Promise<ProfileEntity> {
    const profile = await this.repository.findByEmail(email);
    if (!profile) {
      throw new NotFoundException(`Profile with email ${email} not found`);
    }
    return profile;
  }
}
