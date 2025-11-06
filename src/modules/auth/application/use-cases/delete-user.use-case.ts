import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import {
    USER_REPOSITORY,
    type UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly repository: UserRepository,
    ) {}

    execute(id: string): Promise<UserEntity> {
        return this.repository.deleteUser(id);
    }
}
