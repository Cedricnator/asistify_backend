import { DocumentChunkType } from '@prisma/client';
import { ChunkTypeEntity } from '../../domain/entities/chunk-type.entity';

export class ChunkTypeMapper {
  static toDomain(raw: DocumentChunkType): ChunkTypeEntity {
    return new ChunkTypeEntity(
      raw.id,
      raw.name,
      raw.created_at,
      raw.updated_at,
    );
  }

  static toList(rawList: DocumentChunkType[]): ChunkTypeEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }
}
