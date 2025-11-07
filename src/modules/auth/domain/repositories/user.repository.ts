import { UserEntity } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  createUser(
    email: string,
    password: string,
    name: string,
  ): Promise<UserEntity>;
  inviteUser(email: string): Promise<UserEntity>;
  listUsers(page?: number): Promise<UserEntity[]>;
  updateUser(
    id: string,
    updates: Partial<{ user: UserEntity; password: string }>,
  ): Promise<UserEntity>;
  deleteUser(id: string): Promise<UserEntity>;
}
