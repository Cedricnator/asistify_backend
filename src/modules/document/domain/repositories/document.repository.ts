import { CreateDocumentCommand } from '../commands/create-document.command';
import { DocumentEntity } from '../entities/document.entity';

export const DOCUMENT_REPOSITORY = Symbol('DOCUMENT_REPOSITORY');

export interface DocumentRepository {
  create(params: CreateDocumentCommand): Promise<DocumentEntity>;
  findAll(params: {
    enterpriseId: string;
    page?: number;
    limit?: number;
    name?: string;
  }): Promise<DocumentEntity[]>;
  findOne(id: string): Promise<DocumentEntity>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}
