import { Inject, Injectable } from '@nestjs/common';
import { RoleEntity } from 'src/modules/profile/domain/entities/role.entity';
import {
  ROLE_REPOSITORY,
  type RoleRepository,
} from 'src/modules/profile/domain/repositories/role.repository';

@Injectable()
export class FindRolesUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repo: RoleRepository,
  ) {}

  async execute(): Promise<RoleEntity[]> {
    return await this.repo.findAll();
  }
}
