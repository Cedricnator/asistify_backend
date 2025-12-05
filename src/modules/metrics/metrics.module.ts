import { Module } from '@nestjs/common';
import { CALENDAR_METRICS } from './domain/ports/out/calendar-metric.port';
import { DashboardHomeUseCase } from './application/use-cases/find-dashboard-home.use-case';
import { MetricsController } from './infrastructure/controllers/metrics.controller';

import { CALL_HISTORY } from './domain/ports/out/call-history.port';
import { PrismaCallHistoryAdapter } from './infrastructure/adapters/prisma.call-history.adapter';
import { SaveCallHistoryUseCase } from './application/use-cases/save-call-history.use-case';
import { OVERVIEW_DATA_PORT } from './domain/ports/out/overview-data.port';
import { LocalOverviewDataAdapter } from './infrastructure/adapters/local.overview-data.adapter';
import { DocumentModule } from '../document/document.module';
import { GoogleCalendarMetricsAdapter } from './infrastructure/adapters/google.calendar-metrics.adapter';
import { CalendarDatesAdapter } from '../calendar/infrastructure/calendar-dates.adapter';
import { CalendarModule } from '../calendar/calendar.module';
import { CALENDAR_DATES_PORT } from './domain/ports/out/calendar-dates.port';
import { EnterpriseModule } from '../enterprise/enterprise.module';
import { ENTERPRISE_REPOSITORY } from '../enterprise/domain/repositories/enterprise.repository';
import { EnterprisePrismaRepository } from '../enterprise/infrastructure/prisma/enterprise.prisma.repository';
import { CountReceptionistUseCase } from '../receptionist/application/use-cases/recepcionist/count-receptionist.use-case';
import { ReceptionistModule } from '../receptionist/receptionist.module';

@Module({
  imports: [
    DocumentModule,
    CalendarModule,
    EnterpriseModule,
    ReceptionistModule,
  ],
  controllers: [MetricsController],
  providers: [
    DashboardHomeUseCase,
    CountReceptionistUseCase,
    CalendarDatesAdapter,
    {
      provide: ENTERPRISE_REPOSITORY,
      useClass: EnterprisePrismaRepository,
    },
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
      useClass: PrismaCallHistoryAdapter,
    },
    SaveCallHistoryUseCase,
    {
      provide: 'OVERVIEW_DATA_PORT',
      useClass: LocalOverviewDataAdapter,
    },
  ],
  exports: [SaveCallHistoryUseCase],
})
export class MetricsModule {}
