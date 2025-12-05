import { Inject, Injectable } from '@nestjs/common';
import { CalendarMetricPort } from '../../domain/ports/out/calendar-metric.port';
import {
  CALENDAR_DATES_PORT,
  type CalendarDatesPort,
} from '../../domain/ports/out/calendar-dates.port';
import { CalendarMetric } from '../../domain/entities/calendar-metric.entity';
import { DateSummaryDto } from '../../domain/dto/date-summary.dto';
import {
  ENTERPRISE_REPOSITORY,
  type EnterpriseRepository,
} from '../../../enterprise/domain/repositories/enterprise.repository';

@Injectable()
export class GoogleCalendarMetricsAdapter implements CalendarMetricPort {
  constructor(
    @Inject(CALENDAR_DATES_PORT)
    private readonly calendarDatesPort: CalendarDatesPort,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: EnterpriseRepository,
  ) {}

  async getMetrics(idEnterprise: string): Promise<CalendarMetric> {
    const calendarId = await this.getCalendarIdFromEnterprise(idEnterprise);

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
  private async getCalendarIdFromEnterprise(
    idEnterprise: string,
  ): Promise<string> {
    const enterprise = await this.enterpriseRepository.findById(idEnterprise);
    if (!enterprise) {
      throw new Error('Enterprise not found');
    }
    if (!enterprise.calendarId) {
      throw new Error('Enterprise does not have a calendar ID yet');
    }
    return enterprise.calendarId;
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
