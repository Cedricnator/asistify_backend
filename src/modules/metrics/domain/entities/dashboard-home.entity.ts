import { CallHistory } from './call-history.entity';
import { CalendarMetric } from './calendar-metric.entity';
import { OverviewEntrepriseEntity } from './overview-entreprise.entity';

export class DashboardHomeEntity {
  constructor(
    private readonly overview: OverviewEntrepriseEntity,
    private readonly calendarMetrics: CalendarMetric,
    private readonly callHistory: CallHistory[],
  ) {}
}
