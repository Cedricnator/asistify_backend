import { Inject, Injectable } from '@nestjs/common';
import {
  CALENDAR_METRICS,
  type CalendarMetricPort,
} from '../../domain/ports/out/calendar-metric.port';
import {
  CALL_HISTORY,
  type CallHistoryPort,
} from '../../domain/ports/out/call-history.port';

@Injectable()
export class DashboardHomeUseCase {
  constructor(
    @Inject(CALENDAR_METRICS)
    private readonly calendarMetricsPort: CalendarMetricPort,
    @Inject(CALL_HISTORY)
    private readonly history: CallHistoryPort,
  ) {}
  async execute(idEnterprise: string) {
    console.log(this.calendarMetricsPort.getMetrics(idEnterprise));

    const dashboardData = {
      calendarMetrics: await this.calendarMetricsPort.getMetrics(idEnterprise),
      callHistory: await this.history.getHistory(idEnterprise),
    };
    return dashboardData;
  }
}
