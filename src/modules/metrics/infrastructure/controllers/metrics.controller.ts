import { Controller, Get, Version } from '@nestjs/common';
import { DashboardHomeUseCase } from '../../application/use-cases/find-dashboard-home.use-case';
import { EnterpriseId } from '../../../auth/infrastructure/decorators/enterprise-id.decorator';

@Controller('dashboard')
export class MetricsController {
  constructor(private readonly dashboardHomeUseCase: DashboardHomeUseCase) {}

  @Get()
  @Version('1')
  async getMetrics(@EnterpriseId() enterpriseId: string) {
    return await this.dashboardHomeUseCase.execute(enterpriseId);
  }
}
