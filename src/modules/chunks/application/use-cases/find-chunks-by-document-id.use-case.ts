import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CHUNK_REPOSITORY,
  type ChunkRepository,
} from '../../domain/repositories/chunk.repository';
import { ChunkEntity } from '../../domain/entities/chunk.entity';

@Injectable()
export class FindChunksByDocumentIdUseCase {
  private readonly logger = new Logger(FindChunksByDocumentIdUseCase.name);

  constructor(
    @Inject(CHUNK_REPOSITORY)
    private readonly repo: ChunkRepository,
  ) {}

  async execute(documentId: string): Promise<ChunkEntity[]> {
    this.logger.log(`Finding chunks for document ID: ${documentId}`);
    return await this.repo.findAll(documentId);
  }
}
