import { Inject, Injectable } from '@nestjs/common';
import { CalendarMetricPort } from '../../domain/ports/out/calendar-metric.port';
import {
  CALENDAR_DATES_PORT,
  type CalendarDatesPort,
} from '../../domain/ports/out/calendar-dates.port';
import { CalendarMetric } from '../../domain/entities/calendar-metric.entity';
import { DateSummaryDto } from '../../domain/dto/date-summary.dto';

@Injectable()
export class GoogleCalendarMetricsAdapter implements CalendarMetricPort {
  constructor(
    @Inject(CALENDAR_DATES_PORT)
    private readonly calendarDatesPort: CalendarDatesPort,
  ) {}

  async getMetrics(idEnterprise: string): Promise<CalendarMetric> {
    const calendarId = this.getCalendarIdFromEnterprise(idEnterprise);

    const dates: DateSummaryDto[] =
      await this.calendarDatesPort.listDates(calendarId);

    const metrics = this.stats(dates);

    return new CalendarMetric(
      new Date(),
      metrics.availableCount,
      metrics.confirmed,
      metrics.toConfirm,
    );
  }
  private getCalendarIdFromEnterprise(idEnterprise: string): string {
    // TODO: Implement logic to retrieve calendar ID based on enterprise ID
    return 'primary';
  }
  private stats(dates: DateSummaryDto[]): {
    availableCount: number;
    confirmed: number;
    toConfirm: number;
  } {
    let availableCount = 5;
    let confirmed = 0;
    let toConfirm = 0;
    const CONFIRMED_KEYWORD = 'confirmada';
    const TO_CONFIRM_KEYWORD = 'por confirmar';
    const FREE_KEYWORD = 'libre';
    for (const date of dates) {
      const nameLower = date.name.toLowerCase();
      if (nameLower.includes(CONFIRMED_KEYWORD)) {
        confirmed++;
      } else if (nameLower.includes(TO_CONFIRM_KEYWORD)) {
        toConfirm++;
      } else {
        availableCount++;
      }
    }
    return { availableCount, confirmed, toConfirm };
  }
}
