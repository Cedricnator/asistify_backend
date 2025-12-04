import { OverviewDataPort } from '../../domain/ports/out/overview-data.port';
import { OverviewEntrepriseEntity } from '../../domain/entities/overview-entreprise.entity';
import { Injectable } from '@nestjs/common';
import { DocumentsCountAdapter } from '../../../document/infrastucture/documents-count.adapter';
import { CountReceptionistUseCase } from '../../../receptionist/application/use-cases/recepcionist/count-receptionist.use-case';

@Injectable()
export class LocalOverviewDataAdapter implements OverviewDataPort {
  constructor(
    private readonly documentsCountPort: DocumentsCountAdapter,
    private readonly countReceptionistUseCase: CountReceptionistUseCase,
  ) {}

  async getOverviewData(
    idEnterprise: string,
  ): Promise<OverviewEntrepriseEntity> {
    const countDocuments = await this.getDocumentsCount(idEnterprise);
    const countRecepcionists = await this.getReceptionistsCount(idEnterprise);

    return new OverviewEntrepriseEntity(countDocuments, 34, countRecepcionists);
  }

  async getDocumentsCount(idEnterprise: string): Promise<number> {
    return await this.documentsCountPort.getDocumentsCount(idEnterprise);
  }
  async getReceptionistsCount(idEnterprise: string): Promise<number> {
    return this.countReceptionistUseCase.execute({
      enterpriseId: idEnterprise,
    });
  }
}
