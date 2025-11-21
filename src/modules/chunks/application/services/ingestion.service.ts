import { Injectable, Logger } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { CreateChunkCommand } from '../../domain/commands/create-chunk.command';
import { CreateChunksUseCase } from '../use-cases/create-chunks.use-case';

export interface IngestDocumentParams {
  content: string;
  documentId: string;
  documentChunkTypeId: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly geminiClient: GoogleGenAI;
  private readonly embeddingModel: string = 'gemini-embedding-001';

  constructor(
    private readonly createChunksUseCase: CreateChunksUseCase,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.geminiClient = new GoogleGenAI({ apiKey });
  }

  async ingestDocument(params: IngestDocumentParams): Promise<void> {
    const {
      content,
      documentId,
      documentChunkTypeId,
      chunkSize = 1000,
      chunkOverlap = 200,
    } = params;

    this.logger.log(`Starting ingestion for document ${documentId}`);

    try {
      const chunks = await this.splitText(content, chunkSize, chunkOverlap);
      this.logger.log(`Split document into ${chunks.length} chunks`);

      const chunksWithEmbeddings = await this.generateEmbeddings(chunks);
      this.logger.log(
        `Generated embeddings for ${chunksWithEmbeddings.length} chunks`,
      );

      const commands: CreateChunkCommand[] = chunksWithEmbeddings.map(
        (chunk) => ({
          content: chunk.text,
          documentId: documentId,
          embedding: chunk.embedding,
          keywords: this.extractKeywords(chunk.text),
          metadata: {
            chunkSize: chunkSize,
            chunkOverlap: chunkOverlap,
            characterCount: chunk.text.length,
            wordCount: chunk.text.split(/\s+/).length,
          },
          documentChunkTypeId: documentChunkTypeId,
        }),
      );

      await this.createChunksUseCase.execute(commands);
      this.logger.log(
        `Successfully ingested ${commands.length} chunks for document ${documentId}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error ingesting document ${documentId}: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }

  private async splitText(
    content: string,
    chunkSize: number,
    chunkOverlap: number,
  ): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    const docs = await splitter.createDocuments([content]);
    return docs
      .map((doc) => doc.pageContent)
      .filter((text) => {
        // Filter out chunks that are too short or only contain metadata
        const trimmed = text.trim();
        if (trimmed.length < 10) return false;
        // Filter out chunks that only contain "-- X of Y --" pattern
        if (/^--\s*\d+\s+of\s+\d+\s*--$/.test(trimmed)) return false;
        return true;
      });
  }

  private async generateEmbeddings(
    texts: string[],
  ): Promise<Array<{ text: string; embedding: number[] }>> {
    const batchSize = 100;
    const results: Array<{ text: string; embedding: number[] }> = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      this.logger.debug(
        `Processing embedding batch ${i / batchSize + 1}/${Math.ceil(texts.length / batchSize)}`,
      );

      const batchResults = await Promise.all(
        batch.map(async (text) => {
          try {
            const result = await this.geminiClient.models.embedContent({
              model: this.embeddingModel,
              contents: text,
              config: {
                taskType: 'RETRIEVAL_DOCUMENT',
                outputDimensionality: 1536,
              },
            });

            return {
              text,
              embedding: result.embeddings?.[0]?.values || [],
            };
          } catch (error) {
            const err = error as Error;
            this.logger.error(
              `Error generating embedding for chunk: ${err.message}`,
            );
            throw new Error(`Failed to generate embedding: ${err.message}`);
          }
        }),
      );

      results.push(...batchResults);
    }

    return results;
  }

  private extractKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const wordFreq = words.reduce(
      (acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const sortedWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return sortedWords;
  }
}
