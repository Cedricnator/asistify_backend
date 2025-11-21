import { Inject, Injectable } from '@nestjs/common';
import {
    CALENDAR_REPOSITORY,
    type CalendarRepository,
} from '../../domain/repositories/calendar.repository';
import { GetDateCommand } from '../../domain/commands/get-date.command';
import { DateEntity } from '../../domain/entities/date.entity';

@Injectable()
export class GetDateUseCase {
    constructor(
        @Inject(CALENDAR_REPOSITORY)
        private readonly repository: CalendarRepository,
    ) {}

    execute(command: GetDateCommand): Promise<DateEntity> {
        return this.repository.getDate(
            command.calendarId,
            command.eventId
            
        );
    }
}