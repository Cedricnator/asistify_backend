import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CHUNK_REPOSITORY,
  SearchChunksParams,
  type ChunkRepository,
} from '../../domain/repositories/chunk.repository';
import { ChunkEntity } from '../../domain/entities/chunk.entity';

@Injectable()
export class SearchChunkUseCase {
  private readonly logger = new Logger(SearchChunkUseCase.name);

  constructor(
    @Inject(CHUNK_REPOSITORY)
    private readonly chunkRepository: ChunkRepository,
  ) {}

  async execute(params: SearchChunksParams): Promise<ChunkEntity[]> {
    this.logger.log(
      'Executing SearchChunkUseCase with params: ' + JSON.stringify(params),
    );
    return await this.chunkRepository.search(params);
  }
}
