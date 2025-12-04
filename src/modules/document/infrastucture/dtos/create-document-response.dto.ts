import { DocumentEntity } from '../../domain/entities/document.entity';

export class CreateDocumentResponseDto {
  document: DocumentEntity;
  chunkCount: number;

  constructor(document: DocumentEntity, chunkCount: number) {
    this.document = document;
    this.chunkCount = chunkCount;
  }
}

