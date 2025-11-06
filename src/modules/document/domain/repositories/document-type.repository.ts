import { CreateDocumentTypeCommand } from '../commands/create-document-type.command';
import { DocumentTypeEntity } from '../entities/document-type.entity';

export const DOCUMENT_TYPE_REPOSITORY = Symbol('DOCUMENT_TYPE_REPOSITORY');

export interface DocumentTypeRepository {
  create(params: CreateDocumentTypeCommand): Promise<DocumentTypeEntity>;
  findAll(): Promise<DocumentTypeEntity[]>;
  findOne(id: string): Promise<DocumentTypeEntity>;
  update(params: {
    id: string;
    updates: Partial<DocumentTypeEntity>;
  }): Promise<DocumentTypeEntity>;
  delete(id: string): Promise<void>;
}
