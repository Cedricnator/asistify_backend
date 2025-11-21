import { CalendarEntity } from '../entities/calendar.entity';
import { DateEntity } from '../entities/date.entity';

export const CALENDAR_REPOSITORY = Symbol('CALENDAR_REPOSITORY');

export interface CalendarRepository {
    createCalendar(
        summary: string,
        
    ): Promise<CalendarEntity>;
    listCalendars():Promise<CalendarEntity[]>;
    createDate(calendarId: string,summary:string,start: Date,end:Date,timezone:string|undefined): Promise<DateEntity>;
    listDates(calendarId: string): Promise<DateEntity[]>;
    getDate(calendarId:string,eventId:string):Promise<DateEntity>;
    updateDate(
        calendarId:string,
        eventId:string,
        summary:string,
        startDate:Date,
        endDate:Date,
        timeZone:string|undefined
    ): Promise<DateEntity>;
    deleteDate(calendarId:string,eventId: string): Promise<void>;
}
