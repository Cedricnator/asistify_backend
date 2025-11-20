import { Controller, Get, Param, ParseUUIDPipe, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindChunksByDocumentIdUseCase } from '../../application/use-cases/find-chunks-by-document-id.use-case';
import { ChunkEntity } from '../../domain/entities/chunk.entity';

@ApiTags('Chunk Controller')
@Controller('documents/:documentId/chunks')
export class ChunkController {
  constructor(
    private readonly findChunksUseCase: FindChunksByDocumentIdUseCase,
  ) {}

  @Version('1')
  @ApiOperation({
    summary: 'Get chunks by document ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of chunks for the specified document ID.',
  })
  @Get()
  async findChunksByDocumentId(
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ): Promise<ChunkEntity[]> {
    return await this.findChunksUseCase.execute(documentId);
  }
}
