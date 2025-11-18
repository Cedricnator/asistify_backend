import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(params: { email: string; password: string; name: string }) {
    this.logger.log(`Registering new user with email: ${params.email}`);
    return await this.userRepository.register(params);
  }
}
