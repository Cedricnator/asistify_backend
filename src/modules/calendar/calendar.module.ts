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

@Module({
  imports: [SupabaseModule],
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
  ],
  exports: [ListDatesUseCase],
})
export class CalendarModule {}
