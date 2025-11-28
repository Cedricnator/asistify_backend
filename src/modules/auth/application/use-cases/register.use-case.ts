import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import { ProfileEntity } from '../../../profile/domain/entities/profile.entity';
import { CreateProfileUseCase } from '../../../profile/application/use-cases/profile/create-profile.use-case';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);
  private readonly defaultRoleId: string;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly createProfileUseCase: CreateProfileUseCase,
  ) {
    this.defaultRoleId = '550e8400-e29b-41d4-a716-446655440002';
  }

  async execute(params: {
    email: string;
    password: string;
    name: string;
    phoneNumber?: string;
    avatar?: string;
  }): Promise<{
    user: ProfileEntity;
    accessToken: string;
    refreshToken: string;
  }> {
    this.logger.log(`Registering new user with email: ${params.email}`);

    let userId: string;
    let accessToken: string;
    let refreshToken: string;

    try {
      // 1. Create user in Supabase Auth
      const authResult = await this.userRepository.register({
        email: params.email,
        password: params.password,
        name: params.name,
      });

      this.logger.log(
        `User created in Supabase with ID: ${authResult.user.id}`,
      );
      userId = authResult.user.id;
      accessToken = authResult.accessToken;
      refreshToken = authResult.refreshToken;
    } catch (error: unknown) {
      // If user already exists in Supabase, throw conflict error
      const authError = error as { code?: string; status?: number };
      if (authError.code === 'email_exists' || authError.status === 422) {
        this.logger.warn(
          `Registration attempt failed: User with email ${params.email} already exists`,
        );
        throw new ConflictException(
          'Un usuario con este correo electrónico ya está registrado',
        );
      }
      throw error;
    }

    // 2. Create profile in our database
    try {
      const profile = await this.createProfileUseCase.execute({
        userId,
        name: params.name,
        email: params.email,
        roleId: this.defaultRoleId,
        phoneNumber: params.phoneNumber || '',
        avatar: params.avatar || '',
      });

      this.logger.log(`Profile created for user: ${userId}`);
      return {
        user: profile,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      // If profile creation fails, cleanup the Supabase user
      this.logger.error(
        `Profile creation failed for user ${userId}, cleaning up Supabase user`,
      );
      try {
        await this.userRepository.deleteUser(userId);
      } catch (deleteError) {
        this.logger.error(
          `Failed to cleanup Supabase user ${userId}: ${deleteError}`,
        );
      }
      throw error;
    }
  }
}
