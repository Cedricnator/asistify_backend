import { Inject, Injectable } from '@nestjs/common';
import {
    CALENDAR_REPOSITORY,
    type CalendarRepository,
} from '../../domain/repositories/calendar.repository';
import { ListDateCommand } from '../../domain/commands/list-date.command';
import { DateEntity } from '../../domain/entities/date.entity';
import { CalendarEntity } from '../../domain/entities/calendar.entity';

@Injectable()
export class ListCalendarsUseCase {
    constructor(
        @Inject(CALENDAR_REPOSITORY)
        private readonly repository: CalendarRepository,
    ) {}

    execute(): Promise<CalendarEntity[]> {
            return this.repository.listCalendars(
            
        );
    }
}