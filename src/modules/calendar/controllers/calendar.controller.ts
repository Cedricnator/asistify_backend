import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from 'src/modules/auth/infrastructure/guards/supabase-auth.guard';
import { Roles } from 'src/modules/auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/infrastructure/guards/roles.guard';
import { CreateDateUseCase } from '../application/use-cases/create-date.use-case';
import { CreateCalendarUseCase } from '../application/use-cases/create-calendar.use-case';
import { ListDatesUseCase } from '../application/use-cases/list-date.use-case';
import { GetDateUseCase } from '../application/use-cases/get-date.use-case';
import { DeleteDateUseCase } from '../application/use-cases/delete-date.use-case';
import { UpdateDateUseCase } from '../application/use-cases/update-date.use-case';
import { CalendarDto } from '../domain/dto/calendar.dto';
import { CreateDateDto } from '../domain/dto/create-date.dto';
import { DateDto } from '../domain/dto/date.dto';
import { ListCalendarsUseCase } from '../application/use-cases/list-calendars.use-case';
import { CreateDateCommand } from '../domain/commands/create-date.command';
import { UpdateDateCommand } from '../domain/commands/update-date.command';
import { google } from 'googleapis';
import { Public } from 'src/modules/auth/infrastructure/decorators/public.decorator';

@ApiTags('users')
@Controller('calendar')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class CalendarController {
  constructor(
    private readonly createCalendarUseCase: CreateCalendarUseCase,
    private readonly listCalendarsUseCase: ListCalendarsUseCase,
    private readonly createDateUseCase: CreateDateUseCase,
    private readonly listDatesUseCase: ListDatesUseCase,
    private readonly getDateUseCase: GetDateUseCase,
    private readonly updateDateUseCase: UpdateDateUseCase,
    private readonly deleteDateUseCase: DeleteDateUseCase,
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new calendar' })
  async createCalendar(@Body() dto: CalendarDto): Promise<CalendarDto> {
    return await this.createCalendarUseCase.execute(dto);
  }

  @Version('1')
  @Post('date')
  @ApiOperation({ summary: 'Create a new date on a calendar' })
  async createDate(@Body() dto: CreateDateDto): Promise<CreateDateDto> {
    const command: CreateDateCommand = {
      calendarId: dto.calendarId,
      name: dto.name,
      startDatetime: new Date(dto.startDatetime),
      endDatetime: new Date(dto.startDatetime),
      timezone: dto.timezone ?? undefined,
    };
    return await this.createDateUseCase.execute(command);
  }

  @Version('1')
  @Get()
  @ApiOperation({ summary: 'List calendars' })
  async listCalendars(): Promise<CalendarDto[]> {
    return await this.listCalendarsUseCase.execute();
  }

  @Version('1')
  @Get('dates')
  @ApiOperation({ summary: 'List calendar events' })
  async list(@Query('calendarId') calendarId): Promise<DateDto[]> {
    return await this.listDatesUseCase.execute({ calendarId });
  }

  @Version('1')
  @Get('date')
  @ApiOperation({ summary: 'Get calendar event details' })
  async getDate(
    @Query('calendarId') calendarId,
    @Query('eventId') eventId,
  ): Promise<DateDto> {
    return await this.getDateUseCase.execute({ calendarId, eventId });
  }

  @Version('1')
  @Patch('date')
  @ApiOperation({ summary: 'Update event data' })
  async update(@Body() dto: DateDto): Promise<DateDto> {
    const command: UpdateDateCommand = {
      calendarId: dto.calendarId,
      eventId: dto.eventId,
      name: dto.name,
      startDatetime: new Date(dto.startDatetime),
      endDatetime: new Date(dto.endDatetime),
      timezone: dto.timezone ?? undefined,
    };

    return await this.updateDateUseCase.execute(command);
  }

  @Version('1')
  @Delete('date')
  @ApiOperation({ summary: 'Remove an event' })
  async remove(
    @Query('calendarId') calendarId: string,
    @Query('eventId') eventId: string,
  ): Promise<void> {
    return await this.deleteDateUseCase.execute({ calendarId, eventId });
  }

  @Version('1')
  @Get('caloauth2')
  @Public()
  @ApiOperation({ summary: 'hacky thing' })
  async getoauth(@Query('code') code: string): Promise<string> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GCLIENT_ID,
      process.env.GCLIENT_SECRET,
      'https://localhost:3000/oauth2callback',
    );

    const { tokens } = await oauth2Client.getToken(code);
    // tokens = { access_token, refresh_token, scope, expiry_date, ... }

    // ⚠️ Store both securely in your DB
    console.log(JSON.stringify(tokens));

    return 'Google Calendar linked successfully!';
  }
}
