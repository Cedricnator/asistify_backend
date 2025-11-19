import { CalendarMetric } from '../../entities/calendar-metric.entity';

export const CALENDAR_METRICS = 'CALENDAR_METRICS';

export interface CalendarMetricPort {
  getMetrics(idEnterprise: string): Promise<CalendarMetric>;
}
