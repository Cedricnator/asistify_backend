import { Inject, Injectable } from '@nestjs/common';
import {
  CHUNK_TYPE_REPOSITORY,
  type ChunkTypeRepository,
} from '../../domain/repositories/chunk-type.repository';
import { ChunkTypeEntity } from '../../domain/entities/chunk-type.entity';

@Injectable()
export class FindChunkTypesUseCase {
  constructor(
    @Inject(CHUNK_TYPE_REPOSITORY)
    private readonly repo: ChunkTypeRepository,
  ) {}

  async execute(): Promise<ChunkTypeEntity[]> {
    return this.repo.findAll();
  }
}
