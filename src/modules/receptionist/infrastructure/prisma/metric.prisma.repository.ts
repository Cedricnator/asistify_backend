import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { MetricEntity } from '../../domain/entities/metric.entity';
import { MetricRepository } from '../../domain/repositories/metric.repository';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { MetricMapper } from '../mappers/metric.mapper';
import { CreateMetricCommand } from '../../domain/commands/create-metric.command';

@Injectable()
export class MetricPrismaRepository implements MetricRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(params: CreateMetricCommand): Promise<MetricEntity> {
    const metric = await this.prismaService.metric.create({
      data: MetricMapper.toCreate(params),
    });
    return MetricMapper.toDomain(metric);
  }

  async findAll(params: {
    recepcionistId: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<MetricEntity>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [metrics, total] = await Promise.all([
      this.prismaService.metric.findMany({
        where: {
          receptionistId: params.recepcionistId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.metric.count({
        where: {
          receptionistId: params.recepcionistId,
        },
      }),
    ]);

    return {
      data: MetricMapper.toDomainList(metrics),
      meta: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneById(id: string): Promise<MetricEntity | null> {
    const metric = await this.prismaService.metric.findUnique({
      where: {
        id: id,
      },
    });
    if (!metric) {
      throw new NotFoundException(`Metric with id ${id} not found`);
    }
    return MetricMapper.toDomain(metric);
  }
}
