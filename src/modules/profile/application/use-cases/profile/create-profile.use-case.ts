import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProfileCommand } from 'src/modules/profile/domain/commands/create-profile.command';
import { ProfileEntity } from 'src/modules/profile/domain/entities/profile.entity';
import {
  PROFILE_REPOSITORY,
  type ProfileRepository,
} from 'src/modules/profile/domain/repositories/profile.repository';
import { FindProfileByEmailUseCase } from './find-profile-by-email.use-case';
import { FindRoleByIdUseCase } from '../role/find-role-by-id.use-case';

@Injectable()
export class CreateProfileUseCase {
  private readonly logger = new Logger(CreateProfileUseCase.name);

  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly repo: ProfileRepository,
    private readonly findRoleByIdUseCase: FindRoleByIdUseCase,
    private readonly findProfileByEmailUseCase: FindProfileByEmailUseCase,
  ) {}

  async execute(params: CreateProfileCommand): Promise<ProfileEntity> {
    await this.findRoleByIdUseCase.execute(params.roleId);
    try {
      const existingProfile = await this.findProfileByEmailUseCase.execute(
        params.email,
      );
      this.logger.log(
        `Profile with email ${params.email} already exists. Returning existing profile.`,
      );
      return existingProfile;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.log(`Creating new profile with email ${params.email}.`);
        return await this.repo.create(params);
      }
      throw error;
    }
  }
}
