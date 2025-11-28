import { OverviewEntrepriseEntity } from '../../entities/overview-entreprise.entity';

export const OVERVIEW_DATA_PORT = 'OVERVIEW_DATA_PORT';
export interface OverviewDataPort {
  getOverviewData(idEnterprise: string): Promise<OverviewEntrepriseEntity>;
}
