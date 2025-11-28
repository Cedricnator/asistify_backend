import { DashboardHomeEntity } from '../entities/dashboard-home.entity';

export interface DashboardHomeRepository {
  findWithIdEnterprise(idEnterprise: string): Promise<DashboardHomeEntity>;
}
