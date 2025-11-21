import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CHUNK_TYPE_REPOSITORY,
  type ChunkTypeRepository,
} from '../../domain/repositories/chunk-type.repository';
import { ChunkTypeEntity } from '../../domain/entities/chunk-type.entity';

@Injectable()
export class FindChunkTypeUseCase {
  private readonly logger = new Logger(FindChunkTypeUseCase.name);

  constructor(
    @Inject(CHUNK_TYPE_REPOSITORY)
    private readonly repo: ChunkTypeRepository,
  ) {}

  async execute(id: string): Promise<ChunkTypeEntity> {
    this.logger.log(`Executing FindChunkTypeUseCase for id: ${id}`);
    const ct = await this.repo.findById(id);
    if (!ct) {
      this.logger.warn(`Chunk type with id ${id} not found`);
      throw new NotFoundException(`Chunk type with id ${id} not found`);
    }
    return ct;
  }
}
