import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { MetricEntity } from '../../domain/entities/metric.entity';
import { CreateMetricDto } from '../dtos/create-metric.dto';
import { CreateMetricUseCase } from '../../application/use-cases/metric/create-metric.use-case';
import { FindAllMetricsUseCase } from '../../application/use-cases/metric/find-all-metrics.use-case';
import { FindMetricByIdUseCase } from '../../application/use-cases/metric/find-metric-by-id.use-case';

@Controller('metrics')
export class MetricController {
  constructor(
    private readonly createMetricUseCase: CreateMetricUseCase,
    private readonly findAllMetricsUseCase: FindAllMetricsUseCase,
    private readonly findMetricByIdUseCase: FindMetricByIdUseCase,
  ) {}

  @Version('1')
  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateMetricDto): Promise<MetricEntity> {
    return await this.createMetricUseCase.execute(dto);
  }

  @Version('1')
  @Get()
  @HttpCode(200)
  async findAll(
    @Query('recepcionistId', ParseUUIDPipe) recepcionistId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedResponseDto<MetricEntity>> {
    return await this.findAllMetricsUseCase.execute({
      recepcionistId,
      page,
      limit,
    });
  }

  @Version('1')
  @Get(':id')
  @HttpCode(200)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MetricEntity | null> {
    return await this.findMetricByIdUseCase.execute(id);
  }
}
