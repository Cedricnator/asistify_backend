import { Module } from '@nestjs/common';
import { HealthService } from './application/health.service';
import { HealthController } from './infrastructure/health.controller';

@Module({
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
