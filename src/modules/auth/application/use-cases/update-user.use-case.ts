import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepository,
  ) {}

  execute(command: {
    id: string;
    updates: Partial<{ user: UserEntity; password: string }>;
  }): Promise<UserEntity> {
    return this.repository.updateUser(command.id, command.updates);
  }
}
