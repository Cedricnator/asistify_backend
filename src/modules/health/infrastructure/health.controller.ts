import { Controller, Get, HttpCode } from '@nestjs/common';
import { HealthService } from '../application/health.service';
import { Public } from '../../auth/infrastructure/decorators/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @ApiOperation({
    summary: 'Get health status of the application',
  })
  @ApiResponse({
    status: 200,
    description: 'The application is healthy',
    schema: {
      example: {
        status: 'OK',
        timestamp: '2024-06-01T12:00:00.000Z',
      },
    },
  })
  @Get()
  @HttpCode(200)
  getHealth() {
    return this.healthService.getHealthStatus();
  }
}
