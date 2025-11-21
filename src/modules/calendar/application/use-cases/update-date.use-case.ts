import { Inject, Injectable } from '@nestjs/common';
import {
    CALENDAR_REPOSITORY,
    type CalendarRepository,
} from '../../domain/repositories/calendar.repository';
import { UpdateDateCommand } from '../../domain/commands/update-date.command';
import { DateEntity } from '../../domain/entities/date.entity';

@Injectable()
export class UpdateDateUseCase {
    constructor(
        @Inject(CALENDAR_REPOSITORY)
        private readonly repository: CalendarRepository,
    ) {}

    execute(command: UpdateDateCommand): Promise<DateEntity> {
        return this.repository.updateDate(
            command.calendarId,
            command.eventId,
            command.name,
            command.startDatetime,
            command.endDatetime,
            command.timezone
        );
    }
}