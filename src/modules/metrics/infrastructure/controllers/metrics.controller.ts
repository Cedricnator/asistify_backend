import { Controller, Get, Version } from '@nestjs/common';
import { DashboardHomeUseCase } from '../../application/use-cases/find-dashboard-home.use-case';

@Controller('dashboard')
export class MetricsController {
  constructor(private readonly dashboardHomeUseCase: DashboardHomeUseCase) {}

  @Get()
  @Version('1')
  async getMetrics() {
    //TODO: replace "idEnterprise" with real idEnterprise from token

    return await this.dashboardHomeUseCase.execute('idEnterprise');
  }
}
