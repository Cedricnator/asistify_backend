import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDateDto {
    @ApiProperty({ description: 'Displayed name for the calendar', required: true })
    @IsString()
    calendarId: string;
    name:string;
    startDatetime:Date
    endDatetime:Date
    timezone:string|undefined
}
