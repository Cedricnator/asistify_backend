import { Inject, Injectable } from '@nestjs/common';
import {
  CALENDAR_METRICS,
  type CalendarMetricPort,
} from '../../domain/ports/out/calendar-metric.port';
import {
  CALL_HISTORY,
  type CallHistoryPort,
} from '../../domain/ports/out/call-history.port';
import { DashboardHomeEntity } from '../../domain/entities/dashboard-home.entity';
import {
  OVERVIEW_DATA_PORT,
  type OverviewDataPort,
} from '../../domain/ports/out/overview-data.port';

@Injectable()
export class DashboardHomeUseCase {
  constructor(
    @Inject(CALENDAR_METRICS)
    private readonly calendarMetricsPort: CalendarMetricPort,
    @Inject(CALL_HISTORY)
    private readonly history: CallHistoryPort,
    @Inject(OVERVIEW_DATA_PORT)
    private readonly overviewDataPort: OverviewDataPort,
  ) {}
  async execute(idEnterprise: string): Promise<DashboardHomeEntity> {
    console.log(this.calendarMetricsPort.getMetrics(idEnterprise));

    const dashboardData: DashboardHomeEntity = new DashboardHomeEntity(
      await this.overviewDataPort.getOverviewData(idEnterprise),
      await this.calendarMetricsPort.getMetrics(idEnterprise),
      await this.history.getHistory(idEnterprise),
    );
    return dashboardData;
  }
}
