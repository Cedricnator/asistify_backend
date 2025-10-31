import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssistantService {
    private readonly logger = new Logger(AssistantService.name);
    constructor(private readonly prismaService: PrismaService) {}

    getVoiceResponse() {
        return {
            message: 'This is a voice response from the Assistant Service.',
        };
    }
}
