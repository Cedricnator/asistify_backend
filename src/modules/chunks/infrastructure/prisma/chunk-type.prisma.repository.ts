import { Injectable, Logger } from '@nestjs/common';
import { ChunkTypeRepository } from '../../domain/repositories/chunk-type.repository';
import { ChunkTypeEntity } from '../../domain/entities/chunk-type.entity';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ChunkTypeMapper } from '../mappers/chunk-type.mapper';

@Injectable()
export class ChunkTypePrismaRepository implements ChunkTypeRepository {
  private readonly logger = new Logger(ChunkTypePrismaRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<ChunkTypeEntity[]> {
    this.logger.log('Fetching all chunk types from the database');
    const dt = await this.prismaService.documentType.findMany();
    this.logger.log(`Found ${dt.length} chunk types`);
    return ChunkTypeMapper.toList(dt);
  }

  async findById(id: string): Promise<ChunkTypeEntity | null> {
    this.logger.log(`Fetching chunk type with id ${id} from the database`);
    const dt = await this.prismaService.documentType.findUnique({
      where: { id },
    });
    if (!dt) {
      this.logger.warn(`Chunk type with id ${id} not found`);
      return null;
    }
    this.logger.log(`Chunk type with id ${id} found`);
    return ChunkTypeMapper.toDomain(dt);
  }
}
