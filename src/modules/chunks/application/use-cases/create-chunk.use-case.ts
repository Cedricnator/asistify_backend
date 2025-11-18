import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChunkEntity } from '../../domain/entities/chunk.entity';
import {
  CHUNK_REPOSITORY,
  type ChunkRepository,
} from '../../domain/repositories/chunk.repository';
import { CreateChunkCommand } from '../../domain/commands/create-chunk.command';

@Injectable()
export class CreateChunkUseCase {
  private readonly logger = new Logger(CreateChunkUseCase.name);

  constructor(
    @Inject(CHUNK_REPOSITORY)
    private readonly repo: ChunkRepository,
  ) {}

  async execute(params: CreateChunkCommand): Promise<ChunkEntity> {
    this.logger.log('Executing CreateChunkUseCase');
    return await this.repo.create(params);
  }
}
