import { DateSummaryDto } from '../../dto/date-summary.dto';

export const CALENDAR_DATES_PORT = 'CALENDAR_DATES_PORT';
export interface CalendarDatesPort {
  listDates(calendarId: string): Promise<DateSummaryDto[]>;
}
