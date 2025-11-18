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
  private readonly embeddingModel: string = 'gemini-embedding-001';

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
      useQueryRewrite = true,
    } = params;

    this.logger.log(`Starting retrieval for query: "${query}"`);

    try {
      let finalQuery = query;
      let rewrittenQuery: string | undefined;

      if (useQueryRewrite) {
        finalQuery = await this.rewriteQueryUseCase.execute(query);
        if (finalQuery !== query) {
          rewrittenQuery = finalQuery;
          this.logger.debug(`Query rewritten: "${query}" → "${finalQuery}"`);
        }
      }

      const queryEmbedding = await this.generateQueryEmbedding(finalQuery);
      this.logger.debug(
        `Generated query embedding with ${queryEmbedding.length} dimensions`,
      );

      const chunks = await this.searchUseCase.execute({
        queryEmbedding,
        matchThreshold,
        matchCount,
        documentId,
      });

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
      throw error;
    }
  }

  private async generateQueryEmbedding(query: string): Promise<number[]> {
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

      return embedding;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error generating query embedding: ${err.message}`);
      throw new Error(`Failed to generate query embedding: ${err.message}`);
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
      useQueryRewrite: true,
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
