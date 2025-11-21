import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Version,
} from '@nestjs/common';
import { CreateEnterpriseCategoryUseCase } from '../../application/use-cases/enterprise-category/create-enterprise-category.use-case';
import { FindEnterpriseCategoriesUseCase } from '../../application/use-cases/enterprise-category/find-enterprise-categories.use-case';
import { FindEnterpriseCategoryByIdUseCase } from '../../application/use-cases/enterprise-category/find-enterprise-category-by-id.use-case';
import { CreateEnterpriseCategoryDto } from '../dtos/create-enterprise-category.dto';
import { EnterpriseCategoryEntity } from '../../domain/entities/enterprise-category.entity';

@Controller('enterprise-categories')
export class EnterpriseCategoryController {
  constructor(
    private readonly createEnterpriseCategoryUseCase: CreateEnterpriseCategoryUseCase,
    private readonly findEnterpriseCategoriesUseCase: FindEnterpriseCategoriesUseCase,
    private readonly findEnterpriseCategoryByIdUseCase: FindEnterpriseCategoryByIdUseCase,
  ) {}

  @Version('1')
  @Post()
  @HttpCode(201)
  async create(
    @Body() dto: CreateEnterpriseCategoryDto,
  ): Promise<EnterpriseCategoryEntity> {
    return await this.createEnterpriseCategoryUseCase.execute(dto);
  }

  @Version('1')
  @Get()
  @HttpCode(200)
  async findAll(): Promise<EnterpriseCategoryEntity[]> {
    return await this.findEnterpriseCategoriesUseCase.execute();
  }

  @Version('1')
  @Get(':id')
  @HttpCode(200)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EnterpriseCategoryEntity> {
    return await this.findEnterpriseCategoryByIdUseCase.execute(id);
  }
}
