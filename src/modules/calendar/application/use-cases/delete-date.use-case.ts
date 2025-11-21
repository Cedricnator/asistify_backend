import { Inject, Injectable } from '@nestjs/common';
import {
    CALENDAR_REPOSITORY,
    type CalendarRepository,
} from '../../domain/repositories/calendar.repository';
import { DeleteDateCommand } from '../../domain/commands/delete-date.command';
import { DateEntity } from '../../domain/entities/date.entity';

@Injectable()
export class DeleteDateUseCase {
    constructor(
        @Inject(CALENDAR_REPOSITORY)
        private readonly repository: CalendarRepository,
    ) {}

    execute(command: DeleteDateCommand): Promise<void> {
        return this.repository.deleteDate(
            command.calendarId,
            command.eventId
            
        );
    }
}