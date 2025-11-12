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
@Controller("goauth")
@Public()
export class GOAuthController {
    constructor(
        private readonly createCalendarUseCase:CreateCalendarUseCase,
        private readonly listCalendarsUseCase:ListCalendarsUseCase,
        private readonly createDateUseCase: CreateDateUseCase,
        private readonly listDatesUseCase: ListDatesUseCase,
        private readonly getDateUseCase: GetDateUseCase,
        private readonly updateDateUseCase: UpdateDateUseCase,
        private readonly deleteDateUseCase: DeleteDateUseCase,
    ) {}

    

    @Version('1')
    @Get()
    @ApiOperation({ summary: 'hacky thing' })
    async getoauth(@Query("code") code: string): Promise<string> {

        const oauth2Client = new google.auth.OAuth2(
            process.env.GCLIENT_ID,
            process.env.GCLIENT_SECRET,
            "http://localhost:3000/goauth")

        const { tokens } = await oauth2Client.getToken(code);
        // tokens = { access_token, refresh_token, scope, expiry_date, ... }

        // ⚠️ Store both securely in your DB
        console.log(JSON.stringify(tokens))

        return "Google Calendar linked successfully!";
    }


}
