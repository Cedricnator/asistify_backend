import { Injectable, Logger } from '@nestjs/common';
import { EnterpriseRepository } from '../../domain/repositories/enterprise.repository';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { EnterpriseEntity } from '../../domain/entities/enterprise.entity';
import { EnterpriseMapper } from '../mappers/enterprise.mapper';
import { CreateEnterpriseCommand } from '../../domain/commands/create-enterprise.command';
import { UpdateEnterpriseCommand } from '../../domain/commands/update-enterprise.command';

@Injectable()
export class EnterprisePrismaRepository implements EnterpriseRepository {
  private readonly logger = new Logger(EnterprisePrismaRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(params: CreateEnterpriseCommand): Promise<EnterpriseEntity> {
    const enterprise = await this.prismaService.enterprise.create({
      data: EnterpriseMapper.toCreate(params),
    });

    return EnterpriseMapper.toDomain(enterprise);
  }

  async findAll(): Promise<EnterpriseEntity[]> {
    const enterprises = await this.prismaService.enterprise.findMany();
    return enterprises.map((enterprise) =>
      EnterpriseMapper.toDomain(enterprise),
    );
  }

  async findById(id: string): Promise<EnterpriseEntity | null> {
    const enterprise = await this.prismaService.enterprise.findUnique({
      where: { id },
    });

    if (!enterprise) return null;

    return EnterpriseMapper.toDomain(enterprise);
  }

  async findByName(name: string): Promise<EnterpriseEntity | null> {
    const enterprise = await this.prismaService.enterprise.findUnique({
      where: { name },
    });

    if (!enterprise) return null;

    return EnterpriseMapper.toDomain(enterprise);
  }

  async update(params: UpdateEnterpriseCommand): Promise<EnterpriseEntity> {
    this.logger.log(`Updating enterprise: ${params.id}`);

    const enterprise = await this.prismaService.enterprise.update({
      where: { id: params.id },
      data: EnterpriseMapper.toUpdate(params),
    });

    return EnterpriseMapper.toDomain(enterprise);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.enterprise.delete({
      where: { id },
    });
  }
}
