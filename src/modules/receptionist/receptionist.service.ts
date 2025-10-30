import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReceptionistEntity } from './entities/receptionist.entity';

@Injectable()
export class ReceptionistService {
    private readonly logger = new Logger(ReceptionistService.name);
    constructor(private readonly prismaService: PrismaService) {}

    async findAll(): Promise<ReceptionistEntity[]> {
        this.logger.log('Finding all receptionists');
        return await this.prismaService.receptionist.findMany();
    }

    findOne(id: string) {
        this.logger.log(`Finding receptionist with id: ${id}`);
        // Implementation to find a receptionist by id
    }

    create(data: any) {
        this.logger.log('Creating a new receptionist');
        // Implementation to create a new receptionist
    }

    update(id: string, data: any) {
        this.logger.log(`Updating receptionist with id: ${id}`);
        // Implementation to update a receptionist by id
    }

    delete(id: string) {
        this.logger.log(`Deleting receptionist with id: ${id}`);
        // Implementation to delete a receptionist by id
    }
}
