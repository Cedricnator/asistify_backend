import { CallHistory } from './call-history.entity';
import { CalendarMetric } from './calendar-metric.entity';

export class DashboardHomeEntity {
  constructor(
    private readonly documentCount: number,
    private readonly receptionistCount: number,
    private readonly calendarMetrics: CalendarMetric,
    private readonly scheduleCalendarCount: [],
    private readonly callHistory: CallHistory[],
  ) {}
}
