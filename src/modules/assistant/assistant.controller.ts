import { Controller, Get } from '@nestjs/common';
import { AssistantService } from './assistant.service';

@Controller('assistants')
export class AssistantController {
    constructor(private readonly assistantService: AssistantService) {}

    @Get()
    getVoiceResponse() {
        return this.assistantService.getVoiceResponse();
    }
}
