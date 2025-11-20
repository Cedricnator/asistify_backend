import { Controller, Get, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindChunkTypesUseCase } from '../../application/use-cases/find-chunk-types.use-case';
import { ChunkTypeEntity } from '../../domain/entities/chunk-type.entity';

@ApiTags('Chunk Type Controller')
@Controller()
export class ChunkTypeController {
  constructor(private readonly findChunkTypesUseCase: FindChunkTypesUseCase) {}

  @Version('1')
  @ApiOperation({
    summary: 'Get all chunk types',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all chunk types.',
  })
  @Get()
  async getAllChunkTypes(): Promise<ChunkTypeEntity[]> {
    return await this.findChunkTypesUseCase.execute();
  }
}
