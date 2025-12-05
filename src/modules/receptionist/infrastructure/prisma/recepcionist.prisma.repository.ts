import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { CreateReceptionistCommand } from '../../domain/commands/create-recepcionist.command';
import { ReceptionistEntity } from '../../domain/entities/receptionist.entity';
import { ReceptionistRepository } from '../../domain/repositories/recepcionist.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ReceptionistMapper } from '../mappers/receptionist.mapper';

@Injectable()
export class ReceptionistPrismaRepository implements ReceptionistRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(params: CreateReceptionistCommand): Promise<ReceptionistEntity> {
    const receptionist = await this.prismaService.receptionist.create({
      data: ReceptionistMapper.toCreate(params),
      include: {
        avatar: true,
      },
    });

    return ReceptionistMapper.toDomain(receptionist);
  }

  async findOneById(id: string): Promise<ReceptionistEntity | null> {
    const receptionsit = await this.prismaService.receptionist.findUnique({
      where: {
        id: id,
      },
      include: {
        avatar: true,
      },
    });

    if (!receptionsit) {
      throw new NotFoundException(`Receptionist with id ${id} not found`);
    }

    return ReceptionistMapper.toDomain(receptionsit);
  }

  async findAll(params: {
    enterpriseId: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<ReceptionistEntity>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [receptionists, total] = await Promise.all([
      this.prismaService.receptionist.findMany({
        where: {
          enterpriseId: params.enterpriseId,
        },
        include: {
          avatar: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.receptionist.count({
        where: {
          enterpriseId: params.enterpriseId,
        },
      }),
    ]);

    return {
      data: ReceptionistMapper.toDomainList(receptionists),
      meta: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(params: ReceptionistEntity): Promise<ReceptionistEntity> {
    const updated = await this.prismaService.receptionist.update({
      where: {
        id: params.id,
      },
      data: ReceptionistMapper.toUpdate(params),
      include: {
        avatar: true,
      },
    });
    return ReceptionistMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.receptionist.delete({
      where: {
        id: id,
      },
    });
  }
}
