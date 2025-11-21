import { Inject, Injectable } from '@nestjs/common';
import {
  DOCUMENT_TYPE_REPOSITORY,
  type DocumentTypeRepository,
} from '../../../domain/repositories/document-type.repository';

@Injectable()
export class FindDocumentTypesUseCase {
  constructor(
    @Inject(DOCUMENT_TYPE_REPOSITORY)
    private readonly documentTypeRepository: DocumentTypeRepository,
  ) {}

  async execute() {
    return await this.documentTypeRepository.findAll();
  }
}
