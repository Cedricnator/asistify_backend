import { Inject, Injectable } from '@nestjs/common';
import { ProfileEntity } from 'src/modules/profile/domain/entities/profile.entity';
import {
  PROFILE_REPOSITORY,
  type ProfileRepository,
} from 'src/modules/profile/domain/repositories/profile.repository';
import { FindProfileByIdUseCase } from './find-profile-by-id.use-case';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly repo: ProfileRepository,
    private readonly findProfileByIdUseCase: FindProfileByIdUseCase,
  ) {}

  async execute(params: {
    id: string;
    data: Partial<ProfileEntity>;
  }): Promise<ProfileEntity> {
    const profile = await this.findProfileByIdUseCase.execute(params.id);
    return await this.repo.update(profile);
  }
}
