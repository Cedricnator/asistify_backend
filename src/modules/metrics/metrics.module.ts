import { Module } from '@nestjs/common';
import { CALENDAR_METRICS } from './domain/ports/out/calendar-metric.port';
import { DashboardHomeUseCase } from './application/use-cases/find-dashboard-home.use-case';
import { MetricsController } from './infrastructure/controllers/metrics.controller';
import { CALL_HISTORY } from './domain/ports/out/call-history.port';
import { LocalCallHistoryAdapter } from './infrastructure/adapters/local.call-history.adapter';
import { OVERVIEW_DATA_PORT } from './domain/ports/out/overview-data.port';
import { LocalOverviewDataAdapter } from './infrastructure/adapters/local.overview-data.adapter';
import { DocumentModule } from '../document/document.module';
import { GoogleCalendarMetricsAdapter } from './infrastructure/adapters/google.calendar-metrics.adapter';
import { CalendarDatesAdapter } from '../calendar/infrastructure/calendar-dates.adapter';
import { CalendarModule } from '../calendar/calendar.module';
import { CALENDAR_DATES_PORT } from './domain/ports/out/calendar-dates.port';

@Module({
  imports: [DocumentModule, CalendarModule],
  controllers: [MetricsController],
  providers: [
    DashboardHomeUseCase,
    CalendarDatesAdapter,
    {
      provide: CALENDAR_METRICS,
      useClass: GoogleCalendarMetricsAdapter,
    },
    {
      provide: CALENDAR_DATES_PORT,
      useClass: CalendarDatesAdapter,
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
