import { Inject, Injectable } from '@nestjs/common';
import {
  CALENDAR_METRICS,
  type CalendarMetricPort,
} from '../../domain/ports/out/calendar-metric.port';

@Injectable()
export class DashboardHomeUseCase {
  constructor(
    @Inject(CALENDAR_METRICS)
    private readonly calendarMetricsPort: CalendarMetricPort,
  ) {}
  execute(idEnterprise: string) {
    return this.calendarMetricsPort.getMetrics(idEnterprise);
  }
}
