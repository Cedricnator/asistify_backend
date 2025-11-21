import { Injectable } from '@nestjs/common';
import { CalendarDatesPort } from '../../metrics/domain/ports/out/calendar-dates.port';
import { ListDatesUseCase } from '../application/use-cases/list-date.use-case';
import { DateSummaryDto } from '../../metrics/domain/dto/date-summary.dto';
import { DateEntity } from '../domain/entities/date.entity';

@Injectable()
export class CalendarDatesAdapter implements CalendarDatesPort {
  constructor(private readonly listDateUseCase: ListDatesUseCase) {}

  async listDates(calendarId: string): Promise<DateSummaryDto[]> {
    const dates: Promise<DateEntity[]> = this.listDateUseCase.execute({
      calendarId,
    });
    return (await dates).map((date) => ({
      calendarId: date.calendarId,
      name: date.name,
      eventId: date.eventId,
    }));
  }
}
