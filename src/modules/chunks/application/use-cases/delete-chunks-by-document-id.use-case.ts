import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CHUNK_REPOSITORY,
  type ChunkRepository,
} from '../../domain/repositories/chunk.repository';

@Injectable()
export class DeleteChunksByDocumentIdUseCase {
  private readonly logger = new Logger(DeleteChunksByDocumentIdUseCase.name);

  constructor(
    @Inject(CHUNK_REPOSITORY)
    private readonly repo: ChunkRepository,
  ) {}

  async execute(documentId: string): Promise<void> {
    this.logger.log(`Deleting chunks for document ID: ${documentId}`);
    return await this.repo.deleteByDocumentId(documentId);
  }
}
