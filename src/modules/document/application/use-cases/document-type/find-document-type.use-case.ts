import { Inject, Injectable } from '@nestjs/common';
import {
  DOCUMENT_TYPE_REPOSITORY,
  type DocumentTypeRepository,
} from 'src/modules/document/domain/repositories/document-type.repository';

@Injectable()
export class FindDocumentTypeUseCase {
  constructor(
    @Inject(DOCUMENT_TYPE_REPOSITORY)
    private readonly documentTypeRepository: DocumentTypeRepository,
  ) {}

  async execute(id: string) {
    return await this.documentTypeRepository.findOne(id);
  }
}
