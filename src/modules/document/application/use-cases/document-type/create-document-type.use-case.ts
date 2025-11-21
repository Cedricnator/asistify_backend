import { Inject, Injectable } from '@nestjs/common';
import { CreateDocumentTypeCommand } from '../../../domain/commands/create-document-type.command';
import { DocumentTypeEntity } from '../../../domain/entities/document-type.entity';
import {
  DOCUMENT_TYPE_REPOSITORY,
  type DocumentTypeRepository,
} from '../../../../document/domain/repositories/document-type.repository';

@Injectable()
export class CreateDocumentTypeUseCase {
  constructor(
    @Inject(DOCUMENT_TYPE_REPOSITORY)
    private readonly documentTypeRepository: DocumentTypeRepository,
  ) {}

  async execute(
    params: CreateDocumentTypeCommand,
  ): Promise<DocumentTypeEntity> {
    return await this.documentTypeRepository.create(params);
  }
}
