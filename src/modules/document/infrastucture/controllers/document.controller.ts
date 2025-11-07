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
} from '@nestjs/swagger';
import { MinioService } from '../../../minio/minio.service';

@Controller('documents')
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);
  constructor(
    private readonly createDocumentUseCase: CreateDocumentUseCase,
    private readonly findDocumentsUseCase: FindDocumentsUseCase,
    private readonly findDocumentUseCase: FindDocumentUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
    private readonly minioService: MinioService,
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
        enterpriseId: {
          type: 'string',
          format: 'uuid',
        },
      },
      required: ['file', 'documentTypeId', 'enterpriseId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The document has been successfully uploaded.',
    type: DocumentEntity,
  })
  @Post('upload')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { documentTypeId: string; enterpriseId: string },
  ): Promise<DocumentEntity> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Subir archivo a MinIO
    const uploadedFile = await this.minioService.uploadFile(file, 'documents');

    // Crear documento en la base de datos
    const dto: CreateDocumentDto = {
      name: file.originalname,
      originalName: file.originalname,
      extensionContent: file.mimetype,
      size: file.size,
      filePath: uploadedFile.url,
      documentTypeId: body.documentTypeId,
      enterpriseId: body.enterpriseId,
    };

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
