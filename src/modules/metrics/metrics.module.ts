import { Module } from '@nestjs/common';
import { CALENDAR_METRICS } from './domain/ports/out/calendar-metric.port';
import { LocalCalendarMetricsAdapter } from './infrastructure/adapters/local.calendar-metrics.adapter';
import { DashboardHomeUseCase } from './application/use-cases/find-dashboard-home.use-case';
import { MetricsController } from './infrastructure/controllers/metrics.controller';
import { CALL_HISTORY } from './domain/ports/out/call-history.port';
import { LocalCallHistoryAdapter } from './infrastructure/adapters/local.call-history.adapter';
import { OVERVIEW_DATA_PORT } from './domain/ports/out/overview-data.port';
import { LocalOverviewDataAdapter } from './infrastructure/adapters/local.overview-data.adapter';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [DocumentModule],
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
    {
      provide: 'OVERVIEW_DATA_PORT',
      useClass: LocalOverviewDataAdapter,
    },
  ],
  exports: [],
})
export class MetricsModule {}
