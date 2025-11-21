import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateEnterpriseCategoryCommand } from '../../domain/commands/create-enterprise-category.command';
import { EnterpriseCategoryEntity } from '../../domain/entities/enterprise-category.entity';
import { EnterpriseCategoryRepository } from '../../domain/repositories/enterprise-category.repository';
import { EnterpriseCategoryMapper } from '../mappers/enterprise-category.mapper';

export class EnterpriseCategoryPrismaRepository
  implements EnterpriseCategoryRepository
{
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    params: CreateEnterpriseCategoryCommand,
  ): Promise<EnterpriseCategoryEntity> {
    const ec = await this.prismaService.enterpriseCategory.create({
      data: EnterpriseCategoryMapper.toCreate(params),
    });
    return EnterpriseCategoryMapper.toDomain(ec);
  }

  async findAll(): Promise<EnterpriseCategoryEntity[]> {
    const ecs = await this.prismaService.enterpriseCategory.findMany();
    return EnterpriseCategoryMapper.toDomainArray(ecs);
  }

  async findById(id: string): Promise<EnterpriseCategoryEntity | null> {
    const ec = await this.prismaService.enterpriseCategory.findUnique({
      where: { id },
    });
    if (!ec) return null;
    return EnterpriseCategoryMapper.toDomain(ec);
  }
}
