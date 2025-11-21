import { CalendarMetricPort } from '../../domain/ports/out/calendar-metric.port';
import { CalendarMetric } from '../../domain/entities/calendar-metric.entity';

export class LocalCalendarMetricsAdapter implements CalendarMetricPort {
  async getMetrics(idEnterprise: string): Promise<CalendarMetric> {
    //TODO: Implement local calendar metrics retrieval logic

    return new CalendarMetric(new Date(), 34, 35, 36);
  }
}
