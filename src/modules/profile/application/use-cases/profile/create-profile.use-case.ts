import { Inject, Injectable } from '@nestjs/common';
import { CreateProfileCommand } from 'src/modules/profile/domain/commands/create-profile.command';
import { ProfileEntity } from 'src/modules/profile/domain/entities/profile.entity';
import {
  PROFILE_REPOSITORY,
  type ProfileRepository,
} from 'src/modules/profile/domain/repositories/profile.repository';
import { FindProfileByEmailUseCase } from './find-profile-by-email.use-case';
import { FindRoleByIdUseCase } from '../role/find-role-by-id.use-case';
import { CreateUserUseCase } from 'src/modules/auth/application/use-cases/create-user.use-case';

@Injectable()
export class CreateProfileUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly repo: ProfileRepository,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findRoleByIdUseCase: FindRoleByIdUseCase,
    private readonly findProfileByEmailUseCase: FindProfileByEmailUseCase,
  ) {}

  async execute(params: CreateProfileCommand): Promise<ProfileEntity> {
    await this.findRoleByIdUseCase.execute(params.roleId);
    await this.findProfileByEmailUseCase.execute(params.email);
    const userCreatedFromSupabase = await this.createUserUseCase.execute({
      email: params.email,
      password: params.password,
      name: params.name,
    });
    const paramsWithUserId = {
      ...params,
      userId: userCreatedFromSupabase.id,
    };
    return await this.repo.create(paramsWithUserId);
  }
}
