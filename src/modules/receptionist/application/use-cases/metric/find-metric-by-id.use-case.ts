import { Inject, Injectable } from '@nestjs/common';
import { MetricEntity } from '../../../domain/entities/metric.entity';
import {
  METRIC_REPOSITORY,
  type MetricRepository,
} from '../../../domain/repositories/metric.repository';

@Injectable()
export class FindMetricByIdUseCase {
  constructor(
    @Inject(METRIC_REPOSITORY)
    private readonly metricRepository: MetricRepository,
  ) {}

  async execute(id: string): Promise<MetricEntity | null> {
    return await this.metricRepository.findOneById(id);
  }
}
