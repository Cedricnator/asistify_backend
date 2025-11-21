import { Inject, Injectable } from '@nestjs/common';
import {
    CALENDAR_REPOSITORY,
    type CalendarRepository,
} from '../../domain/repositories/calendar.repository';
import { CreateDateCommand } from '../../domain/commands/create-date.command';
import { DateEntity } from '../../domain/entities/date.entity';

@Injectable()
export class CreateDateUseCase {
    constructor(
        @Inject(CALENDAR_REPOSITORY)
        private readonly repository: CalendarRepository,
    ) {}

    execute(command: CreateDateCommand): Promise<DateEntity> {
        console.log(typeof command.startDatetime)
        return this.repository.createDate(
            command.calendarId,
            command.name,
            command.startDatetime,
            command.endDatetime,
            command.timezone
        );
    }
}