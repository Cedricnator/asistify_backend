import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Version,
} from '@nestjs/common';
import { CreateDocumentUseCase } from '../../application/use-cases/document/create-document.use-case';
import { FindDocumentsUseCase } from '../../application/use-cases/document/find-documents.use-case';
import { FindDocumentUseCase } from '../../application/use-cases/document/find-document.use-case';
import { DeleteDocumentUseCase } from '../../application/use-cases/document/delete-document.use-case';
import { CreateDocumentDto } from '../dtos/create-document.dto';
import { DocumentEntity } from '../../domain/entities/document.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('documents')
export class DocumentController {
  constructor(
    private readonly createDocumentUseCase: CreateDocumentUseCase,
    private readonly findDocumentsUseCase: FindDocumentsUseCase,
    private readonly findDocumentUseCase: FindDocumentUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
  ) {}

  @Version('1')
  @ApiOperation({ summary: 'Create a new document' })
  @ApiResponse({
    status: 201,
    description: 'The document has been successfully created.',
    type: DocumentEntity,
  })
  @Post()
  @HttpCode(201)
  async create(dto: CreateDocumentDto): Promise<DocumentEntity> {
    return await this.createDocumentUseCase.execute(dto);
  }

  @Version('1')
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({
    status: 200,
    description: 'List of all documents.',
    type: [DocumentEntity],
  })
  @Get()
  @HttpCode(200)
  async findAll(): Promise<DocumentEntity[]> {
    return await this.findDocumentsUseCase.execute();
  }

  @Version('1')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiResponse({
    status: 200,
    description: 'The document with the specified ID.',
    type: DocumentEntity,
  })
  @Get(':id')
  @HttpCode(200)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentEntity> {
    return await this.findDocumentUseCase.execute(id);
  }

  @Version('1')
  @ApiOperation({ summary: 'Delete a document by ID' })
  @ApiResponse({
    status: 204,
    description: 'The document has been successfully deleted.',
  })
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.deleteDocumentUseCase.execute(id);
  }
}
