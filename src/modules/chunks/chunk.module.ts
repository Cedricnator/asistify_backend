import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { CHUNK_REPOSITORY } from './domain/repositories/chunk.repository';
import { ChunkPrismaRepository } from './infrastructure/prisma/chunk.prisma.repository';
import { CHUNK_TYPE_REPOSITORY } from './domain/repositories/chunk-type.repository';
import { CreateChunkUseCase } from './application/use-cases/create-chunk.use-case';
import { SearchChunkUseCase } from './application/use-cases/search-chunk.use-case';
import { RewriteQueryUseCase } from './application/use-cases/rewrite-query.use-case';
import { FindChunkTypeUseCase } from './application/use-cases/find-chunk-type.use-case';
import { FindChunkTypesUseCase } from './application/use-cases/find-chunk-types.use-case';
import { DeleteChunksByDocumentIdUseCase } from './application/use-cases/delete-chunks-by-document-id.use-case';
import { FindChunksByDocumentIdUseCase } from './application/use-cases/find-chunks-by-document-id.use-case';
import { IngestionService } from './application/services/ingestion.service';
import { RetrivalService } from './application/services/retrival.service';
import { ChunkTypeController } from './infrastructure/controllers/chunk-type.controller';
import { ChunkController } from './infrastructure/controllers/chunk.controller';
import { ConfigService } from '@nestjs/config';
import { CreateChunksUseCase } from './application/use-cases/create-chunks.use-case';

@Module({
  imports: [SupabaseModule],
  providers: [
    ConfigService,
    CreateChunkUseCase,
    CreateChunksUseCase,
    SearchChunkUseCase,
    RewriteQueryUseCase,
    FindChunkTypeUseCase,
    FindChunkTypesUseCase,
    DeleteChunksByDocumentIdUseCase,
    FindChunksByDocumentIdUseCase,
    IngestionService,
    RetrivalService,
    {
      provide: CHUNK_REPOSITORY,
      useClass: ChunkPrismaRepository,
    },
    {
      provide: CHUNK_TYPE_REPOSITORY,
      useClass: ChunkPrismaRepository,
    },
  ],
  controllers: [ChunkTypeController, ChunkController],
})
export class ChunkModule {}
