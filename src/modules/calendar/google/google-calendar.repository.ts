import { Inject, Injectable, Logger } from '@nestjs/common';




import { CalendarRepository } from '../domain/repositories/calendar.repository';
import { CalendarEntity } from '../domain/entities/calendar.entity';
import { DateEntity } from '../domain/entities/date.entity';
import { authProvider} from './google-auth.provider';
import { google } from 'googleapis';
import { calendar, calendar_v3 } from 'googleapis/build/src/apis/calendar';

@Injectable()
export class GoogleCalendarRepository implements CalendarRepository {
    private readonly logger = new Logger(GoogleCalendarRepository.name);
    private readonly env: string;

    constructor() {
      
    }
    

    private shouldSkip(): boolean {
        return (
            this.env === process.env.NODE_ENV || process.env.NODE_ENV === 'test'
        );
    }

    private handleError(error: any) {
        this.logger.error('Error creating user in Supabase', {
            message: error.message,
        });
        //throw error;
    }

    private mapDate(u: any): DateEntity | null {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        //return new DateEntity(u.id, u.name, u.unixTime);
        return null;
    }

    async createCalendar(
        summary:string
    ): Promise<CalendarEntity> {
        
        const auth=(await authProvider).auth
        const calendar = google.calendar({version: 'v3', auth});
        try{
            const response=await calendar.calendars.insert({requestBody:{summary}})
            var createdCalendar=new CalendarEntity(response!.data.id!,summary);
            return createdCalendar;
        }
        catch(error){
            this.handleError(error)
            throw error;
        }
        
        
    }

    async listCalendars(): Promise<CalendarEntity[]> {
        var auth = (await authProvider).auth
        const calendar = google.calendar({ version: 'v3', auth })
        try{
            var response=await calendar.calendarList.list();
        }
        catch(error){
            this.handleError(error)
            throw error;
        }
        return response.data.items?.map((item)=>{
            return new CalendarEntity(item.id!,item.summary!)
        })!
    }

    async createDate(calendarId: string, summary: string, start: Date, end: Date, timeZone = "America/Santiago"): Promise<DateEntity> {
        var auth = (await authProvider).auth
        const calendar = google.calendar({ version: 'v3', auth })
        var startObj = {
            dateTime: start.toISOString(),
            timeZone
        }
        var endObj = {
            dateTime: end.toISOString(),
            timeZone
        }

        try {
            const targetCalendar = calendar.calendars.get({ calendarId })
            var saved = await calendar.events.insert({ calendarId: calendarId, 
                                                        requestBody: {  summary, 
                                                                        start: startObj, 
                                                                        end: endObj } });
            var savedData = saved.data;
            return new DateEntity(calendarId,savedData.id!, 
                                    summary, 
                                        new Date(savedData.start!.dateTime!), 
                                            new Date(savedData.end!.dateTime!),timeZone)
        }
        catch (error) {
            this.handleError(error)
            throw error;
        }


    }

    async listDates(calendarId:string): Promise<DateEntity[]> {
        var auth = (await authProvider).auth
        const calendar = google.calendar({ version: 'v3', auth })
        try{
            var response=await calendar.events.list({calendarId});
        }
        catch(error){
            this.handleError(error)
            throw error;
        }
        return response.data.items?.map((item)=>{
            return new DateEntity(calendarId,item.id!,item.summary!,new Date(item.start?.dateTime!),new Date(item.end?.dateTime!),item.start?.timeZone!)
        })!
    }

    async getDate(calendarId: string, eventId: string): Promise<DateEntity> {
        var auth = (await authProvider).auth
        const calendar = google.calendar({ version: 'v3', auth })
        try{
            var response=await calendar.events.get({calendarId,eventId});
            var savedData = response.data;
            return new DateEntity(calendarId,savedData.id!, 
                                    savedData.summary!, 
                                        new Date(savedData.start!.dateTime!), 
                                            new Date(savedData.end!.dateTime!),savedData.start?.timeZone!)
        }
        catch(error){
            this.handleError(error)
            throw error;
        }
        
    }

    async updateDate(
        calendarId:string,
        eventId:string,
        summary:string,
        startDate:Date,
        endDate:Date,
        timeZone="America/Santiago"
    ): Promise<DateEntity> {
        var auth = (await authProvider).auth
        const calendar = google.calendar({ version: 'v3', auth })
        var startObj = {
            dateTime: startDate.toISOString(),
            timeZone
        }
        var endObj = {
            dateTime: endDate.toISOString(),
            timeZone
        }
        try{
            var response=await calendar.events.update({calendarId,eventId, requestBody: {  summary, 
                                                                        start: startObj, 
                                                                        end: endObj } })
            
            var savedData = response.data;
            return new DateEntity(calendarId,savedData.id!, 
                                    summary, 
                                        new Date(savedData.start!.dateTime!), 
                                          new Date(savedData.end!.dateTime!),timeZone)
        }
        catch(error){
            this.handleError(error)
            throw error;
        }
        
    }

    async deleteDate(calendarId:string,eventId: string): Promise<void> {
        
        var auth = (await authProvider).auth
        const calendar = google.calendar({ version: 'v3', auth })
        try{
            var response=await calendar.events.delete({calendarId,eventId});
            var savedData = response.data;
            return
        }
        catch(error){
            this.handleError(error)
            throw error;
        }
       
    }
}
