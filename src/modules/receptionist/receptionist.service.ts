import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReceptionistEntity } from './entities/receptionist.entity';
import {
    ReceptionistNotFoundException,
    EnterpriseNotFoundException,
    ReceptionistHasDependenciesException,
} from './errors/receptionist.errors';
import { CreateReceptionistDto } from './dto/create-receptionist.dto';
import { AssistantManager } from './assistant/assistant-manager';
import { ReceptionistPersonality } from './assistant/types/receptionist-personality';
import { ReceptionistSession } from './assistant/types/receptionist-session';

@Injectable()
export class ReceptionistService {
    private readonly logger = new Logger(ReceptionistService.name);
    constructor(
        private readonly prismaService: PrismaService,
        private readonly assistantManager: AssistantManager,
    ) {}

    getVoiceResponse() {
        this.logger.log('Generating voice response');
        return {
            message: 'This is a voice response from the Assistant Service.',
        };
    }

    /**
     * Initialize voice assistant for Twilio integration
     * Returns a ready-to-use VoiceAgent instance
     *
     */
    async initializeVoiceAssistant(receptionistId: string) {
        this.logger.log(
            `Initializing voice assistant for receptionist: ${receptionistId}`,
        );

        // Fetch the latest receptionist data from database
        const receptionist = await this.prismaService.receptionist.findUnique({
            where: { id: receptionistId },
        });

        if (!receptionist) {
            throw new ReceptionistNotFoundException(receptionistId);
        }

        // Prepare personality configuration
        const personality: ReceptionistPersonality = {
            name: receptionist.name,
            levelFormality: receptionist.levelFormality,
            levelDynamism: receptionist.levelDynamism,
            enterpriseInformation: receptionist.enterpriseInformation,
            clientInformation: receptionist.clientInformation,
            businessRestrictions: receptionist.businessRestrictions,
        };

        // Get VoiceAgent instance
        const voiceSession = await this.assistantManager.initializeVoiceSession(
            personality,
            receptionist.id,
        );

        this.logger.log(
            `Voice session ready for ${receptionist.name} - Formality: ${receptionist.levelFormality}/10, Dynamism: ${receptionist.levelDynamism}/10`,
        );

        // Return the VoiceAgent instance that Twilio can use directly
        return voiceSession;
    }

    async findAll(): Promise<ReceptionistEntity[]> {
        this.logger.log('Finding all receptionists');
        return await this.prismaService.receptionist.findMany();
    }

    async findOne(id: string): Promise<ReceptionistEntity> {
        this.logger.log(`Finding receptionist with id: ${id}`);

        const receptionist = await this.prismaService.receptionist.findUnique({
            where: { id },
        });

        if (!receptionist) {
            throw new ReceptionistNotFoundException(id);
        }

        return receptionist;
    }

    async create(data: CreateReceptionistDto): Promise<ReceptionistEntity> {
        this.logger.log('Creating a new receptionist');

        // Check if enterprise exists
        const enterprise = await this.prismaService.enterprise.findUnique({
            where: { id: data.enterpriseId },
        });

        if (!enterprise) {
            throw new EnterpriseNotFoundException(data.enterpriseId);
        }

        // const newTwilioNumber = await this.twilioService.createNumber();
        const newTwilioNumber = '+56934567890';

        // Create the receptionist
        return this.prismaService.receptionist.create({
            data: {
                name: data.name,
                cellphone: newTwilioNumber,
                avatarId: data.avatarId,
                enterpriseInformation: data.enterpriseInformation,
                clientInformation: data.clientInformation,
                businessRestrictions: data.businessRestrictions,
                levelFormality: data.levelFormality,
                levelDynamism: data.levelDynamism,
                anticipationMaxDays: data.anticipationMaxDays,
                anticipationMinDays: data.anticipationMinDays,
                enterpriseId: data.enterpriseId,
            },
        });
    }

    async update(id: string, data: any): Promise<ReceptionistEntity> {
        this.logger.log(`Updating receptionist with id: ${id}`);

        // Check if receptionist exists
        await this.findOne(id); // Throws ReceptionistNotFoundException if not found

        // Update the receptionist
        return this.prismaService.receptionist.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.cellphone && { cellphone: data.cellphone }),
                ...(data.avatarId && { avatarId: data.avatarId }),
                ...(data.enterpriseInformation && {
                    enterpriseInformation: data.enterpriseInformation,
                }),
                ...(data.clientInformation && {
                    clientInformation: data.clientInformation,
                }),
                ...(data.businessRestrictions && {
                    businessRestrictions: data.businessRestrictions,
                }),
                ...(data.levelFormality !== undefined && {
                    levelFormality: data.levelFormality,
                }),
                ...(data.levelDynamism !== undefined && {
                    levelDynamism: data.levelDynamism,
                }),
                ...(data.anticipationMaxDays !== undefined && {
                    anticipationMaxDays: data.anticipationMaxDays,
                }),
                ...(data.anticipationMinDays !== undefined && {
                    anticipationMinDays: data.anticipationMinDays,
                }),
            },
        });
    }

    async delete(id: string): Promise<ReceptionistEntity> {
        this.logger.log(`Deleting receptionist with id: ${id}`);

        // Check if receptionist exists
        const receptionist = await this.findOne(id); // Throws ReceptionistNotFoundException if not found

        // Check if receptionist has metrics (dependencies)
        const metricsCount = await this.prismaService.metric.count({
            where: { receptionistId: id },
        });

        if (metricsCount > 0) {
            throw new ReceptionistHasDependenciesException(
                id,
                `${metricsCount} metric(s)`,
            );
        }

        // Delete the receptionist
        return this.prismaService.receptionist.delete({
            where: { id },
        });
    }
}
