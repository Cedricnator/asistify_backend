import { OverviewDataPort } from '../../domain/ports/out/overview-data.port';
import { OverviewEntrepriseEntity } from '../../domain/entities/overview-entreprise.entity';

export class LocalOverviewDataAdapter implements OverviewDataPort {
  async getOverviewData(
    idEnterprise: string,
  ): Promise<OverviewEntrepriseEntity> {
    return new OverviewEntrepriseEntity(8, 34, 5);
  }
}
