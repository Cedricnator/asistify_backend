import { Inject, Injectable } from '@nestjs/common';

import {
    CALENDAR_REPOSITORY,
    type CalendarRepository,
} from '../../domain/repositories/calendar.repository';
import { CreateCalendarCommand} from '../../domain/commands/create-calendar.command';
import { CalendarEntity } from '../../domain/entities/calendar.entity';

@Injectable()
export class CreateCalendarUseCase {
    constructor(
        @Inject(CALENDAR_REPOSITORY)
        private readonly repository: CalendarRepository,
    ) {}

    execute(command: CreateCalendarCommand): Promise<CalendarEntity> {
        return this.repository.createCalendar(
            command.summary,
        );
    }
}