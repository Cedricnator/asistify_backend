import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import { FindProfileByEmailUseCase } from 'src/modules/profile/application/use-cases/profile/find-profile-by-email.use-case';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly findProfileByIdUseCase: FindProfileByEmailUseCase,
  ) {}

  async execute(params: { email: string; password: string }) {
    this.logger.log(`Attempting login for email: ${params.email}`);
    const loginResult = await this.userRepository.login(params);
    const profile = await this.findProfileByIdUseCase.execute(
      loginResult.user.email,
    );
    return {
      user: profile,
      accessToken: loginResult.accessToken,
      refreshToken: loginResult.refreshToken,
    };
  }
}
