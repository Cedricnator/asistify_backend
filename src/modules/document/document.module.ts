import { Module } from '@nestjs/common';
import { CreateDocumentUseCase } from './application/use-cases/document/create-document.use-case';
import { CreateDocumentTypeUseCase } from './application/use-cases/document-type/create-document-type.use-case';
import { FindDocumentsUseCase } from './application/use-cases/document/find-documents.use-case';
import { FindDocumentUseCase } from './application/use-cases/document/find-document.use-case';
import { DeleteDocumentUseCase } from './application/use-cases/document/delete-document.use-case';
import { FindDocumentTypesUseCase } from './application/use-cases/document-type/find-document-types.use-case';
import { FindDocumentTypeUseCase } from './application/use-cases/document-type/find-document-type.use-case';
import { DOCUMENT_TYPE_REPOSITORY } from './domain/repositories/document-type.repository';
import { DocumentTypePrismaRepository } from './infrastucture/prisma/document-type.prisma.repository';
import { DOCUMENT_REPOSITORY } from './domain/repositories/document.repository';
import { DocumentPrismaRepository } from './infrastucture/prisma/document.prisma.repository';
import { DocumentController } from './infrastucture/controllers/document.controller';
import { DocumentTypeController } from './infrastucture/controllers/document-type.controller';
import { ChunkModule } from '../chunks/chunk.module';
import { TextExtractionService } from './application/services/text-extraction.service';
import { PlainTextStrategy } from './infrastructure/strategies/plain-text.strategy';
import { PdfStrategy } from './infrastructure/strategies/pdf.strategy';
import { DocxStrategy } from './infrastructure/strategies/docx.strategy';
import { ExcelStrategy } from './infrastructure/strategies/excel.strategy';
import { MarkdownStrategy } from './infrastructure/strategies/markdown.strategy';

@Module({
  imports: [ChunkModule],
  providers: [
    CreateDocumentUseCase,
    FindDocumentsUseCase,
    FindDocumentUseCase,
    DeleteDocumentUseCase,

    CreateDocumentTypeUseCase,
    FindDocumentTypesUseCase,
    FindDocumentTypeUseCase,

    TextExtractionService,
    PlainTextStrategy,
    PdfStrategy,
    DocxStrategy,
    ExcelStrategy,
    MarkdownStrategy,

    {
      provide: DOCUMENT_TYPE_REPOSITORY,
      useClass: DocumentTypePrismaRepository,
    },
    {
      provide: DOCUMENT_REPOSITORY,
      useClass: DocumentPrismaRepository,
    },
  ],
  controllers: [DocumentController, DocumentTypeController],
})
export class DocumentModule {}
