import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDateDto {
    @ApiProperty({ description: 'Google ID for the calendar', required: true })
    @IsString()
    calendarId: string;

    @IsString()
     @ApiProperty({
    description: 'Name for the date',
    example: 'Meeting with customer',
  })
    name:string;

     @ApiProperty({
    description: 'Start datetime as ISO string',
    
  })
    startDatetime:Date
     @ApiProperty({
    description: 'End datetime as ISO string',
    
  })
    endDatetime:Date

     @ApiProperty({
    description: 'Timezone as Region/City',
    example: 'America/Santiago',
  })
    timezone:string|undefined
}
