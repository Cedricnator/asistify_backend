import { Metric } from '@prisma/client';
import {
  ConcreteMetricBuilder,
  MetricEntity,
} from '../../domain/entities/metric.entity';
import { CreateMetricCommand } from '../../domain/commands/create-metric.command';

export class MetricMapper {
  static toDomain(raw: Metric): MetricEntity {
    return new ConcreteMetricBuilder()
      .withId(raw.id)
      .withModelUsed(raw.modelUsed)
      .withReceptionistId(raw.receptionistId)
      .withResponseTimeMs(raw.responseTime)
      .withTokenUsage(raw.tokenUsage)
      .withCreatedAt(raw.createdAt)
      .withUpdatedAt(raw.updatedAt)
      .build();
  }

  static toCreate(params: CreateMetricCommand) {
    return {
      modelUsed: params.modelUsed,
      tokenUsage: params.tokenUsage,
      responseTime: params.responseTimeMs,
      receptionistId: params.receptionistId,
    };
  }

  static toDomainList(rawList: Metric[]): MetricEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }
}
