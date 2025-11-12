import { RoleEntity } from '../entities/role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface RoleRepository {
  findAll(): Promise<RoleEntity[]>;
  findById(id: string): Promise<RoleEntity | null>;
}
