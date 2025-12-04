import { Body, Controller, Get, Post, Version } from '@nestjs/common';
import { DashboardHomeUseCase } from '../../application/use-cases/find-dashboard-home.use-case';
import { SaveCallHistoryUseCase } from '../../application/use-cases/save-call-history.use-case';
import { CreateCallHistoryDto } from '../dtos/create-call-history.dto';
import { EnterpriseId } from '../../../auth/infrastructure/decorators/enterprise-id.decorator';

@Controller('dashboard')
export class MetricsController {
  constructor(
    private readonly dashboardHomeUseCase: DashboardHomeUseCase,
    private readonly saveCallHistoryUseCase: SaveCallHistoryUseCase,
  ) {}

  @Get()
  @Version('1')
  async getMetrics(@EnterpriseId() enterpriseId: string) {
    return await this.dashboardHomeUseCase.execute(enterpriseId);
  }

  @Post('call-history')
  @Version('1')
  async createCallHistory(@Body() createCallHistoryDto: CreateCallHistoryDto) {
    return await this.saveCallHistoryUseCase.execute(createCallHistoryDto);
  }
}
