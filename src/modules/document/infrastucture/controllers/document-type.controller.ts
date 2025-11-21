import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Version,
} from '@nestjs/common';
import { FindDocumentTypesUseCase } from '../../application/use-cases/document-type/find-document-types.use-case';
import { FindDocumentTypeUseCase } from '../../application/use-cases/document-type/find-document-type.use-case';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentTypeEntity } from '../../domain/entities/document-type.entity';

@ApiTags('Document Types Controller')
@Controller('document-types')
export class DocumentTypeController {
  constructor(
    private readonly findDocumentTypesUseCase: FindDocumentTypesUseCase,
    private readonly findDOcumentTypeUseCase: FindDocumentTypeUseCase,
  ) {}

  @Version('1')
  @ApiOperation({ summary: 'Get all document types' })
  @Get()
  @HttpCode(200)
  async findAll(): Promise<DocumentTypeEntity[]> {
    return await this.findDocumentTypesUseCase.execute();
  }

  @Version('1')
  @ApiOperation({ summary: 'Get a document type by ID' })
  @Get(':id')
  @HttpCode(200)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentTypeEntity> {
    return await this.findDOcumentTypeUseCase.execute(id);
  }
}
