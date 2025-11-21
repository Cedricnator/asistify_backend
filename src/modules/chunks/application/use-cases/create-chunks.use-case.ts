import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateChunkCommand } from '../../domain/commands/create-chunk.command';
import {
  CHUNK_REPOSITORY,
  type ChunkRepository,
} from '../../domain/repositories/chunk.repository';

@Injectable()
export class CreateChunksUseCase {
  private readonly logger = new Logger(CreateChunksUseCase.name);

  constructor(
    @Inject(CHUNK_REPOSITORY)
    private readonly repo: ChunkRepository,
  ) {}

  async execute(params: CreateChunkCommand[]) {
    this.logger.log(`Creating ${params.length} chunks`);
    return await this.repo.createMany(params);
  }
}
