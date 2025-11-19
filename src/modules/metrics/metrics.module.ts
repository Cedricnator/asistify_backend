import { Module } from '@nestjs/common';
import { CALENDAR_METRICS } from './domain/ports/out/calendar-metric.port';
import { LocalCalendarMetricsAdapter } from './infrastructure/adapters/local.calendar-metrics.adapter';
import { DashboardHomeUseCase } from './application/use-cases/find-dashboard-home.use-case';
import { MetricsController } from './infrastructure/controllers/metrics.controller';
import { CALL_HISTORY } from './domain/ports/out/call-history.port';
import { LocalCallHistoryAdapter } from './infrastructure/adapters/local.call-history.adapter';

@Module({
  imports: [],
  controllers: [MetricsController],
  providers: [
    DashboardHomeUseCase,
    {
      provide: CALENDAR_METRICS,
      useClass: LocalCalendarMetricsAdapter,
    },
    {
      provide: CALL_HISTORY,
      useClass: LocalCallHistoryAdapter,
    },
  ],
  exports: [],
})
export class MetricsModule {}
