import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { SearchChunkUseCase } from '../use-cases/search-chunk.use-case';
import { RewriteQueryUseCase } from '../use-cases/rewrite-query.use-case';
import { ChunkEntity } from '../../domain/entities/chunk.entity';

export interface RetrievalParams {
  query: string;
  documentId?: string;
  matchThreshold?: number;
  matchCount?: number;
  useQueryRewrite?: boolean;
}

export interface RetrievalResult {
  chunks: ChunkEntity[];
  query: string;
  rewrittenQuery?: string;
  totalResults: number;
}

@Injectable()
export class RetrivalService {
  private readonly logger = new Logger(RetrivalService.name);
  private readonly geminiClient: GoogleGenAI;
  private readonly embeddingModel: string = 'embedding-001'; // Soporta 1536 dimensiones
  private readonly embeddingCache = new Map<
    string,
    { embedding: number[]; timestamp: number }
  >();
  private readonly CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas cache (más agresivo)
  private readonly MAX_CACHE_SIZE = 500; // Cache más grande
  private quotaExceeded = false; // Flag para deshabilitar temporalmente

  constructor(
    private readonly searchUseCase: SearchChunkUseCase,
    private readonly rewriteQueryUseCase: RewriteQueryUseCase,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.geminiClient = new GoogleGenAI({ apiKey });
  }

  async retrieve(params: RetrievalParams): Promise<RetrievalResult> {
    const {
      query,
      documentId,
      matchThreshold = 0.7,
      matchCount = 10,
      useQueryRewrite = false,
    } = params;

    this.logger.log(`Starting retrieval for query: "${query}"`);

    try {
      let finalQuery = query;
      let rewrittenQuery: string | undefined;

      // Query rewrite desactivado para evitar consumir quota innecesaria
      if (useQueryRewrite) {
        try {
          finalQuery = await this.rewriteQueryUseCase.execute(query);
          if (finalQuery !== query) {
            rewrittenQuery = finalQuery;
            this.logger.debug(`Query rewritten: "${query}" → "${finalQuery}"`);
          }
        } catch (rewriteError) {
          this.logger.warn(
            `Query rewrite failed, using original: ${rewriteError.message}`,
          );
          finalQuery = query;
        }
      }

      // Try to generate embedding with fallback to keyword search
      let chunks: ChunkEntity[] = [];

      // Check if quota was exceeded previously (circuit breaker)
      if (this.quotaExceeded) {
        this.logger.warn('RAG disabled due to previous quota exceeded error');
        return {
          chunks: [],
          query,
          rewrittenQuery,
          totalResults: 0,
        };
      }

      try {
        const queryEmbedding = await this.generateQueryEmbedding(finalQuery);
        this.logger.debug(
          `Generated query embedding with ${queryEmbedding.length} dimensions`,
        );

        chunks = await this.searchUseCase.execute({
          queryEmbedding,
          matchThreshold,
          matchCount,
          documentId,
        });
      } catch (embeddingError) {
        const err = embeddingError as Error;
        this.logger.error(`Embedding generation failed: ${err.message}`);

        // If quota exceeded, disable RAG temporarily
        if (
          err.message.includes('quota') ||
          err.message.includes('429') ||
          err.message.includes('RESOURCE_EXHAUSTED')
        ) {
          this.quotaExceeded = true;
          this.logger.error(
            '⚠️ QUOTA EXCEEDED - RAG searches disabled temporarily',
          );
          this.logger.error(
            '💡 RAG will re-enable automatically after server restart',
          );
        }

        // Return empty results
        return {
          chunks: [],
          query,
          rewrittenQuery,
          totalResults: 0,
        };
      }

      this.logger.log(
        `Retrieved ${chunks.length} chunks for query: "${query}"`,
      );

      return {
        chunks,
        query,
        rewrittenQuery,
        totalResults: chunks.length,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving chunks for query "${query}": ${err.message}`,
        err.stack,
      );

      // Return empty results instead of throwing to prevent voice agent crash
      return {
        chunks: [],
        query,
        totalResults: 0,
      };
    }
  }

  private async generateQueryEmbedding(query: string): Promise<number[]> {
    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    const cached = this.embeddingCache.get(cacheKey);

    try {
      const result = await this.geminiClient.models.embedContent({
        model: this.embeddingModel,
        contents: query,
        config: {
          taskType: 'RETRIEVAL_QUERY',
          outputDimensionality: 1536,
        },
      });

      const embedding = result.embeddings?.[0]?.values;

      if (!embedding || embedding.length === 0) {
        throw new Error('Failed to generate query embedding: empty result');
      }

      // Cache the embedding BEFORE returning (más agresivo)
      this.cleanupCache();
      this.embeddingCache.set(cacheKey, {
        embedding,
        timestamp: Date.now(),
      });
      this.logger.debug(
        `✅ Cached embedding for query: "${query}" (cache size: ${this.embeddingCache.size})`,
      );

      return embedding;
    } catch (error) {
      const err = error as Error;

      // Log detailed error information
      this.logger.error(`❌ Error generating query embedding: ${err.message}`);
      this.logger.error(`Query: "${query}"`);
      this.logger.error(`Model: ${this.embeddingModel}`);

      // Check if it's a quota error with better detection
      const errorString = err.message.toLowerCase();
      if (
        errorString.includes('quota') ||
        errorString.includes('429') ||
        errorString.includes('resource_exhausted') ||
        errorString.includes('rate limit') ||
        errorString.includes('exceeded')
      ) {
        this.logger.error('🚨 QUOTA/RATE LIMIT EXCEEDED');
        this.logger.error('💡 Suggestions:');
        this.logger.error('   1. Wait 24 hours for quota reset');
        this.logger.error('   2. Upgrade your Gemini API plan');
        this.logger.error('   3. Use a different API key');
        this.logger.error(
          `   4. Current cache size: ${this.embeddingCache.size} queries cached`,
        );

        throw new Error(
          'Embedding API quota exceeded. RAG searches temporarily disabled.',
        );
      }

      throw new Error(`Failed to generate query embedding: ${err.message}`);
    }
  }

  private cleanupCache(): void {
    if (this.embeddingCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entries (first 20%)
      const entriesToRemove = Math.floor(this.MAX_CACHE_SIZE * 0.2);
      const sortedEntries = Array.from(this.embeddingCache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp,
      );

      for (let i = 0; i < entriesToRemove; i++) {
        this.embeddingCache.delete(sortedEntries[i][0]);
      }

      this.logger.debug(`Cleaned up ${entriesToRemove} old cache entries`);
    }
  }

  async getRelevantContext(
    query: string,
    documentId?: string,
    maxTokens: number = 2000,
  ): Promise<string> {
    const chunks = await this.retrieve({
      query,
      documentId,
      matchThreshold: 0.7,
      matchCount: 20,
      useQueryRewrite: false, // Desactivado
    });

    let context = '';
    let tokenCount = 0;

    for (const chunk of chunks.chunks) {
      const chunkText = chunk.content;
      const estimatedTokens = Math.ceil(chunkText.length / 4);

      if (tokenCount + estimatedTokens > maxTokens) {
        break;
      }

      context += chunkText + '\n\n';
      tokenCount += estimatedTokens;
    }

    this.logger.debug(
      `Built context with ${chunks.chunks.length} chunks (~${tokenCount} tokens)`,
    );

    return context.trim();
  }
}
