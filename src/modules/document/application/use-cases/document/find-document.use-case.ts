import { Inject, Injectable } from '@nestjs/common';
import { DocumentEntity } from 'src/modules/document/domain/entities/document.entity';
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from 'src/modules/document/domain/repositories/document.repository';

@Injectable()
export class FindDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(id: string): Promise<DocumentEntity> {
    return await this.documentRepository.findOne(id);
  }
}
