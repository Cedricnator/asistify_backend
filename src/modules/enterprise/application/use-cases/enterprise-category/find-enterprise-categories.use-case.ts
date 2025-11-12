import { Inject, Injectable } from '@nestjs/common';
import { EnterpriseCategoryEntity } from 'src/modules/enterprise/domain/entities/enterprise-category.entity';
import {
  ENTERPRISE_CATEGORY_REPOSITORY,
  type EnterpriseCategoryRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise-category.repository';

@Injectable()
export class FindEnterpriseCategoriesUseCase {
  constructor(
    @Inject(ENTERPRISE_CATEGORY_REPOSITORY)
    private readonly repo: EnterpriseCategoryRepository,
  ) {}

  async execute(): Promise<EnterpriseCategoryEntity[]> {
    return await this.repo.findAll();
  }
}
