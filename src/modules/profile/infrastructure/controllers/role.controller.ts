import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Version,
} from '@nestjs/common';
import { FindRoleByIdUseCase } from '../../application/use-cases/role/find-role-by-id.use-case';
import { FindRolesUseCase } from '../../application/use-cases/role/find-roles.use-case';
import { RoleEntity } from '../../domain/entities/role.entity';

@Controller('roles')
export class RoleController {
  constructor(
    private readonly findRoleByIdUseCase: FindRoleByIdUseCase,
    private readonly findRolesUseCase: FindRolesUseCase,
  ) {}

  @Version('1')
  @Get(':id')
  @HttpCode(200)
  async findOneById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RoleEntity> {
    return await this.findRoleByIdUseCase.execute(id);
  }

  @Version('1')
  @Get()
  async findAll(): Promise<RoleEntity[]> {
    return await this.findRolesUseCase.execute();
  }
}
