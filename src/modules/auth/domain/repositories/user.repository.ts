import { UserEntity } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  login(parans: {
    email: string;
    password: string;
  }): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }>;
  register(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }>;
  refreshSession(currentRefreshToken: string): Promise<{
    user: UserEntity;
    accessToken: string;
    refreshToken: string;
  }>;
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
