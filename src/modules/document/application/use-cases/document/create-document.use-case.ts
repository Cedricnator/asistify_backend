import { Inject, Injectable } from '@nestjs/common';
import { CreateDocumentCommand } from 'src/modules/document/domain/commands/create-document.command';
import { DocumentEntity } from 'src/modules/document/domain/entities/document.entity';
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from 'src/modules/document/domain/repositories/document.repository';

@Injectable()
export class CreateDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(params: CreateDocumentCommand): Promise<DocumentEntity> {
    return await this.documentRepository.create(params);
  }
}
