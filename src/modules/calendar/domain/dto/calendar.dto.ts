import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalendarDto {
    @ApiProperty({ description: 'Displayed name for the calendar', required: true })
    @IsString()
    summary: string;

}
