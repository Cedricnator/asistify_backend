import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { CalendarController } from './controllers/calendar.controller';
import { CreateCalendarUseCase } from './application/use-cases/create-calendar.use-case';
import { CreateDateUseCase } from './application/use-cases/create-date.use-case';
import { ListDatesUseCase } from './application/use-cases/list-date.use-case';
import { GetDateUseCase } from './application/use-cases/get-date.use-case';
import { UpdateDateUseCase } from './application/use-cases/update-date.use-case';
import { DeleteDateUseCase } from './application/use-cases/delete-date.use-case';
import { GoogleCalendarRepository } from './google/google-calendar.repository';
import { CALENDAR_REPOSITORY } from './domain/repositories/calendar.repository';
import { ListCalendarsUseCase } from './application/use-cases/list-calendars.use-case';
import { GOAuthController } from './controllers/oauth.controller';
import { PaymentsModule } from '../payments/payments.module';
import { SUSCRIPTION_REPOSITORY } from '../payments/domain/repositories/suscription.repository';
import { SuscriptionRepositoryAdapter } from '../payments/infrastructure/prisma/suscription.repository.adapter';

@Module({
  imports: [SupabaseModule, PaymentsModule],
  controllers: [CalendarController, GOAuthController],
  providers: [
    CreateCalendarUseCase,
    CreateDateUseCase,
    ListDatesUseCase,
    GetDateUseCase,
    UpdateDateUseCase,
    DeleteDateUseCase,
    ListCalendarsUseCase,

    {
      provide: CALENDAR_REPOSITORY,
      useClass: GoogleCalendarRepository,
    },
    {
      provide:SUSCRIPTION_REPOSITORY,
      useClass:SuscriptionRepositoryAdapter
    }
  ],
  exports: [ListDatesUseCase, CALENDAR_REPOSITORY],
})
export class CalendarModule {}
