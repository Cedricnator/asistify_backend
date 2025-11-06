import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import {
    USER_REPOSITORY,
    type UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class FindUsersUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) {}

    async execute(page?: number): Promise<UserEntity[]> {
        return await this.userRepository.listUsers(page);
    }
}
