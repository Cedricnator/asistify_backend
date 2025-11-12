import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RoleEntity } from 'src/modules/profile/domain/entities/role.entity';
import {
  ROLE_REPOSITORY,
  type RoleRepository,
} from 'src/modules/profile/domain/repositories/role.repository';

@Injectable()
export class FindRoleByIdUseCase {
  private readonly logger = new Logger(FindRoleByIdUseCase.name);

  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repo: RoleRepository,
  ) {}

  async execute(id: string): Promise<RoleEntity> {
    this.logger.log(`Finding role with id ${id}`);
    const role = await this.repo.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    this.logger.log(`Role was found`);
    return role;
  }
}
