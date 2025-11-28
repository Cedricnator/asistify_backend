import { DocumentsCountPort } from '../domain/ports/out/documents-count.port';
import { FindDocumentsUseCase } from '../application/use-cases/document/find-documents.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentsCountAdapter implements DocumentsCountPort {
  constructor(private readonly findDocumentsUseCase: FindDocumentsUseCase) {}
  async getDocumentsCount(idEnterprise: string): Promise<number> {
    const documents = await this.findDocumentsUseCase.execute();
    return documents.length;
  }
}
