import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { ReceptionistService } from './receptionist.service';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';

@Controller('receptionists')
export class ReceptionistController {
    constructor(private readonly receptionistService: ReceptionistService) {}

    @Get('assistant/voice')
    getVoiceResponse() {
        return this.receptionistService.getVoiceResponse();
    }

    @Get()
    findAll() {
        return this.receptionistService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.receptionistService.findOne(id);
    }

    @Post()
    create(@Body() createReceptionistDto: CreateReceptionistDto) {
        return this.receptionistService.create(createReceptionistDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.receptionistService.update(id, data);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.receptionistService.delete(id);
    }
}
