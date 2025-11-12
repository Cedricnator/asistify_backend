import { Inject, Injectable } from '@nestjs/common';
import { CreateMetricCommand } from '../../../domain/commands/create-metric.command';
import { MetricEntity } from '../../../domain/entities/metric.entity';
import {
  METRIC_REPOSITORY,
  type MetricRepository,
} from '../../../domain/repositories/metric.repository';

@Injectable()
export class CreateMetricUseCase {
  constructor(
    @Inject(METRIC_REPOSITORY)
    private readonly metricRepository: MetricRepository,
  ) {}

  async execute(params: CreateMetricCommand): Promise<MetricEntity> {
    return await this.metricRepository.create(params);
  }
}
