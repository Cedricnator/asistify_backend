/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  ChunkRepository,
  SearchChunksParams,
} from '../../domain/repositories/chunk.repository';
import { ChunkEntity } from '../../domain/entities/chunk.entity';
import { CreateChunkCommand } from '../../domain/commands/create-chunk.command';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from 'src/modules/supabase/supabase.module';

@Injectable()
export class ChunkPrismaRepository implements ChunkRepository {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabaseClient: SupabaseClient,
    private readonly prismaService: PrismaService,
  ) {}

  async create(params: CreateChunkCommand): Promise<ChunkEntity> {
    const maxIndex = await this.prismaService.documentChunk.findFirst({
      where: { document_id: params.documentId },
      orderBy: { index: 'desc' },
      select: { index: true },
    });

    const nextIndex = maxIndex ? maxIndex.index + 1 : 0;

    const embeddingString = `[${params.embedding.join(',')}]`;
    const keywordsArray = `{${params.keywords.map((k) => `"${k.replace(/"/g, '\\"')}"`).join(',')}}`;

    const result = await this.prismaService.$queryRawUnsafe<any[]>(
      `
      INSERT INTO document_chunk (
        id, index, content, embedding, keywords, metadata, 
        document_id, document_chunk_type_id, created_at
      )
      VALUES (
        gen_random_uuid()::text, $1, $2, $3::vector, $4::text[], $5::jsonb,
        $6, $7, NOW()
      )
      RETURNING *
      `,
      nextIndex,
      params.content,
      embeddingString,
      keywordsArray,
      JSON.stringify(params.metadata),
      params.documentId,
      params.documentChunkTypeId,
    );

    return this.toDomain(result[0]);
  }

  async createMany(params: CreateChunkCommand[]): Promise<ChunkEntity[]> {
    if (params.length === 0) return [];

    const documentId = params[0].documentId;
    const maxIndex = await this.prismaService.documentChunk.findFirst({
      where: { document_id: documentId },
      orderBy: { index: 'desc' },
      select: { index: true },
    });

    const startIndex = maxIndex ? maxIndex.index + 1 : 0;

    const values = params
      .map((param, idx) => {
        const embeddingString = `[${param.embedding.join(',')}]`;
        const keywordsArray = `{${param.keywords.map((k) => `"${k.replace(/"/g, '\\"')}"`).join(',')}}`;
        const metadataJson = JSON.stringify(param.metadata).replace(/'/g, "''");
        const content = param.content.replace(/'/g, "''");

        return `(
          gen_random_uuid()::text,
          ${startIndex + idx},
          '${content}',
          '${embeddingString}'::vector,
          '${keywordsArray}'::text[],
          '${metadataJson}'::jsonb,
          '${param.documentId}',
          '${param.documentChunkTypeId}',
          NOW()
        )`;
      })
      .join(',');

    const query = `
      INSERT INTO document_chunk (
        id, index, content, embedding, keywords, metadata,
        document_id, document_chunk_type_id, created_at
      )
      VALUES ${values}
      RETURNING *
    `;

    const chunks = await this.prismaService.$queryRawUnsafe<any[]>(query);

    return chunks.map((chunk) => this.toDomain(chunk));
  }

  async findAll(documentId?: string): Promise<ChunkEntity[]> {
    const chunks = await this.prismaService.documentChunk.findMany({
      where: documentId ? { document_id: documentId } : undefined,
      orderBy: { index: 'asc' },
    });

    return chunks.map((chunk) => this.toDomain(chunk));
  }

  async findById(id: string): Promise<ChunkEntity | null> {
    const chunk = await this.prismaService.documentChunk.findUnique({
      where: { id },
    });

    if (!chunk) return null;

    return this.toDomain(chunk);
  }

  async search(params: SearchChunksParams): Promise<ChunkEntity[]> {
    const {
      queryEmbedding,
      matchThreshold = 0.7,
      matchCount = 10,
      documentId,
    } = params;

    const { data, error } = await this.supabaseClient.rpc(
      'match_document_chunks',
      {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
        filter_document_id: documentId || null,
      },
    );

    if (error) {
      throw new Error(`Error searching chunks: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(
      (row: any) =>
        new ChunkEntity(
          row.id,
          row.index,
          row.content,
          row.document_id,
          this.parseEmbedding(row.embedding),
          row.keywords,
          row.metadata,
          row.document_chunk_type_id,
          new Date(row.created_at),
        ),
    );
  }

  async delete(id: string): Promise<void> {
    const chunk = await this.prismaService.documentChunk.findUnique({
      where: { id },
    });

    if (!chunk) {
      throw new NotFoundException(`Chunk with id ${id} not found`);
    }

    await this.prismaService.documentChunk.delete({
      where: { id },
    });
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.prismaService.documentChunk.deleteMany({
      where: { document_id: documentId },
    });
  }

  private toDomain(raw: any): ChunkEntity {
    return new ChunkEntity(
      raw.id,
      raw.index,
      raw.content,
      raw.document_id,
      this.parseEmbedding(raw.embedding),
      raw.keywords,
      raw.metadata,
      raw.document_chunk_type_id,
      raw.created_at,
    );
  }

  private parseEmbedding(embedding: any): number[] {
    if (Array.isArray(embedding)) {
      return embedding;
    }
    if (typeof embedding === 'string') {
      return JSON.parse(embedding);
    }
    return [];
  }
}
