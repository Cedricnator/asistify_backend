import { OverviewDataPort } from '../../domain/ports/out/overview-data.port';
import { OverviewEntrepriseEntity } from '../../domain/entities/overview-entreprise.entity';
import { Injectable } from '@nestjs/common';
import { DocumentsCountAdapter } from '../../../document/infrastucture/documents-count.adapter';

@Injectable()
export class LocalOverviewDataAdapter implements OverviewDataPort {
  constructor(private readonly documentsCountPort: DocumentsCountAdapter) {}

  async getOverviewData(
    idEnterprise: string,
  ): Promise<OverviewEntrepriseEntity> {
    const countDocuments = await this.getDocumentsCount(idEnterprise);

    return new OverviewEntrepriseEntity(countDocuments, 34, 5);
  }

  async getDocumentsCount(idEnterprise: string): Promise<number> {
    // Future: filter by enterprise id via the documents port.
    // For now delegate to the documents port which may call the document module use\-case.
    return await this.documentsCountPort.getDocumentsCount(idEnterprise);
  }
}
