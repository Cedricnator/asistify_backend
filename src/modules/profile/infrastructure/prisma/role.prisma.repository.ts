import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { RoleEntity } from '../../domain/entities/role.entity';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RolePrismRepository implements RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.prismaService.role.findMany();
    return RoleMapper.toDomainList(roles);
  }

  async findById(id: string): Promise<RoleEntity | null> {
    const role = await this.prismaService.role.findUnique({
      where: {
        id: id,
      },
    });
    if (!role) return null;
    return RoleMapper.toDomain(role);
  }
}
