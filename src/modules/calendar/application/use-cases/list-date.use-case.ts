import { Inject, Injectable } from '@nestjs/common';
import {
    CALENDAR_REPOSITORY,
    type CalendarRepository,
} from '../../domain/repositories/calendar.repository';
import { ListDateCommand } from '../../domain/commands/list-date.command';
import { DateEntity } from '../../domain/entities/date.entity';

@Injectable()
export class ListDatesUseCase {
    constructor(
        @Inject(CALENDAR_REPOSITORY)
        private readonly repository: CalendarRepository,
    ) {}

    execute(command: ListDateCommand): Promise<DateEntity[]> {
        return this.repository.listDates(
            command.calendarId,
            
        );
    }
}