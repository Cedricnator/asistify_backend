import { ChunkTypeEntity } from '../entities/chunk-type.entity';

export const CHUNK_TYPE_REPOSITORY = 'CHUNK_TYPE_REPOSITORY';

export interface ChunkTypeRepository {
  findAll(): Promise<ChunkTypeEntity[]>;
  findById(id: string): Promise<ChunkTypeEntity | null>;
}
