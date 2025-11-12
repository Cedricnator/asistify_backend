import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { MetricEntity } from '../../../domain/entities/metric.entity';
import {
  METRIC_REPOSITORY,
  type MetricRepository,
} from '../../../domain/repositories/metric.repository';

@Injectable()
export class FindAllMetricsUseCase {
  constructor(
    @Inject(METRIC_REPOSITORY)
    private readonly metricRepository: MetricRepository,
  ) {}

  async execute(params: {
    recepcionistId: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<MetricEntity>> {
    return await this.metricRepository.findAll(params);
  }
}
