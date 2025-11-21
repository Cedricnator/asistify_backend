import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DateDto {
    @ApiProperty({ description: 'Displayed name for the calendar', required: true })
    @IsString()
    calendarId: string;
    eventId:string;
    name:string;
    startDatetime:Date
    endDatetime:Date
    timezone:string|undefined
}
