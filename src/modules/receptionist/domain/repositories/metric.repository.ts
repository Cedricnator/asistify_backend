import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { MetricEntity } from '../entities/metric.entity';
import { CreateMetricCommand } from '../commands/create-metric.command';

export const METRIC_REPOSITORY = Symbol('METRIC_REPOSITORY');

export interface MetricRepository {
  create(params: CreateMetricCommand): Promise<MetricEntity>;
  findAll(params: {
    recepcionistId: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<MetricEntity>>;
  findOneById(id: string): Promise<MetricEntity | null>;
}
