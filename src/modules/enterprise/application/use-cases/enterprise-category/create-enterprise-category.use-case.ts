import { Inject, Injectable } from '@nestjs/common';
import { CreateEnterpriseCategoryCommand } from 'src/modules/enterprise/domain/commands/create-enterprise-category.command';
import { EnterpriseCategoryEntity } from 'src/modules/enterprise/domain/entities/enterprise-category.entity';
import {
  ENTERPRISE_CATEGORY_REPOSITORY,
  type EnterpriseCategoryRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise-category.repository';

@Injectable()
export class CreateEnterpriseCategoryUseCase {
  constructor(
    @Inject(ENTERPRISE_CATEGORY_REPOSITORY)
    private readonly repo: EnterpriseCategoryRepository,
  ) {}

  async execute(
    params: CreateEnterpriseCategoryCommand,
  ): Promise<EnterpriseCategoryEntity> {
    return await this.repo.create(params);
  }
}
