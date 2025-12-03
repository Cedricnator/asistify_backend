import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Logger,
  Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDocumentUseCase } from '../../application/use-cases/document/create-document.use-case';
import { FindDocumentsUseCase } from '../../application/use-cases/document/find-documents.use-case';
import { FindDocumentUseCase } from '../../application/use-cases/document/find-document.use-case';
import { DeleteDocumentUseCase } from '../../application/use-cases/document/delete-document.use-case';
import { CreateDocumentDto } from '../dtos/create-document.dto';
import { DocumentEntity } from '../../domain/entities/document.entity';
import {
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { MinioService } from '../../../minio/minio.service';
import { TextExtractionService } from '../../application/services/text-extraction.service';
import { IngestionService } from '../../../chunks/application/services/ingestion.service';
import { EnterpriseId } from 'src/modules/auth/infrastructure/decorators/enterprise-id.decorator';
import { strict } from 'node:assert';

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);
  constructor(
    private readonly createDocumentUseCase: CreateDocumentUseCase,
    private readonly findDocumentsUseCase: FindDocumentsUseCase,
    private readonly findDocumentUseCase: FindDocumentUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
    private readonly minioService: MinioService,
    private readonly textExtractionService: TextExtractionService,
    private readonly ingestionService: IngestionService,
  ) {}

  @Version('1')
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        documentTypeId: {
          type: 'string',
          format: 'uuid',
        },
      },
      required: ['file', 'documentTypeId', 'enterpriseId'],
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'The document has been successfully uploaded and processed for RAG.',
    type: DocumentEntity,
  })
  @Post('upload')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @EnterpriseId() enterpriseId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      documentTypeId: string;
    },
  ): Promise<DocumentEntity> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    this.logger.log(`Processing file upload: ${file.originalname}`);

    // Validar que el tipo de archivo sea soportado
    const supportedTypes = this.textExtractionService.getSupportedMimeTypes();
    if (!supportedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Supported types: ${supportedTypes.join(', ')}`,
      );
    }

    // 1. Subir archivo a MinIO
    const uploadedFile = await this.minioService.uploadFile(file, 'documents');
    this.logger.log(`File uploaded to MinIO: ${uploadedFile.fileName}`);

    // 2. Crear documento en la base de datos
    const dto: CreateDocumentDto = {
      name: file.originalname,
      originalName: file.originalname,
      extensionContent: file.mimetype,
      size: file.size,
      filePath: uploadedFile.fileName,
      documentTypeId: body.documentTypeId,
      enterpriseId: enterpriseId,
    };

    const document = await this.createDocumentUseCase.execute(dto);
    this.logger.log(`Document created in DB: ${document.id}`);

    // 3. Extraer texto del archivo usando estrategias
    try {
      const extractedText = await this.textExtractionService.extractText(
        file.buffer,
        file.mimetype,
      );

      this.logger.log(
        `Text extracted successfully: ${extractedText.length} characters`,
      );

      // 4. Hacer ingestion del documento (chunking + embeddings)
      await this.ingestionService.ingestDocument({
        content: extractedText,
        documentId: document.id,
        documentChunkTypeId: '6e199a75-67d8-4dfd-bbbe-5491e5c9faf2',
      });

      this.logger.log(
        `Document ${document.id} successfully ingested for RAG search`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to process document ${document.id}: ${err.message}`,
        err.stack,
      );

      // El documento ya está guardado, pero la ingestion falló
      // Se puede reintentar después manualmente
      throw new BadRequestException(
        `Document uploaded but text extraction/ingestion failed: ${err.message}`,
      );
    }

    return document;
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
  async findAll(@EnterpriseId() enterpriseId: string): Promise<{
    data: DocumentEntity[];
    metadata: {
      limit: number;
      actualPage: number;
      nextPage: number | null;
      totalPages: number;
    };
  }> {
    return await this.findDocumentsUseCase.execute({
      enterpriseId: enterpriseId,
    });
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
