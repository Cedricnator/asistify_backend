import { OverviewDataPort } from '../../domain/ports/out/overview-data.port';
import { OverviewEntrepriseEntity } from '../../domain/entities/overview-entreprise.entity';
import { Inject, Injectable } from '@nestjs/common';
import { DocumentsCountAdapter } from '../../../document/infrastucture/documents-count.adapter';
import { CountReceptionistUseCase } from '../../../receptionist/application/use-cases/recepcionist/count-receptionist.use-case';

import {
  CALL_HISTORY,
  type CallHistoryPort,
} from '../../domain/ports/out/call-history.port';

@Injectable()
export class LocalOverviewDataAdapter implements OverviewDataPort {
  constructor(
    private readonly documentsCountPort: DocumentsCountAdapter,
    private readonly countReceptionistUseCase: CountReceptionistUseCase,
    @Inject(CALL_HISTORY)
    private readonly callHistory: CallHistoryPort,
  ) {}

  async getOverviewData(
    idEnterprise: string,
  ): Promise<OverviewEntrepriseEntity> {
    const countDocuments = await this.getDocumentsCount(idEnterprise);
    const countRecepcionist = await this.getReceptionistsCount(idEnterprise);
    const totalCalls = await this.countTotalCalls(idEnterprise);
    return new OverviewEntrepriseEntity(
      countDocuments,
      totalCalls,
      countRecepcionist,
    );
  }

  async getDocumentsCount(idEnterprise: string): Promise<number> {
    return await this.documentsCountPort.getDocumentsCount(idEnterprise);
  }
  async getReceptionistsCount(idEnterprise: string): Promise<number> {
    return this.countReceptionistUseCase.execute({
      enterpriseId: idEnterprise,
    });
  }
  async countTotalCalls(idEnterprise: string): Promise<number> {
    const calls = await this.callHistory.getHistory(idEnterprise);
    return calls.length;
  }
}
