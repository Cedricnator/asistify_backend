import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import {
    USER_REPOSITORY,
    type UserRepository,
} from '../../domain/repositories/user.repository';
import { CreateUserCommand } from '../../domain/commands/create-user.command';

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly repository: UserRepository,
    ) {}

    execute(command: CreateUserCommand): Promise<UserEntity> {
        return this.repository.createUser(
            command.email,
            command.password,
            command.name,
        );
    }
}
