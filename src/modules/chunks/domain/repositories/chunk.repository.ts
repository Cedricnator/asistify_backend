import { CreateChunkCommand } from '../commands/create-chunk.command';
import { ChunkEntity } from '../entities/chunk.entity';

export const CHUNK_REPOSITORY = 'CHUNK_REPOSITORY';

export interface SearchChunksParams {
  queryEmbedding: number[];
  matchThreshold?: number;
  matchCount?: number;
  documentId?: string;
}

export interface ChunkRepository {
  create(params: CreateChunkCommand): Promise<ChunkEntity>;
  createMany(params: CreateChunkCommand[]): Promise<ChunkEntity[]>;
  findAll(documentId?: string): Promise<ChunkEntity[]>;
  findById(id: string): Promise<ChunkEntity | null>;
  search(params: SearchChunksParams): Promise<ChunkEntity[]>;
  delete(id: string): Promise<void>;
  deleteByDocumentId(documentId: string): Promise<void>;
}
