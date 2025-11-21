import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EnterpriseCategoryEntity } from 'src/modules/enterprise/domain/entities/enterprise-category.entity';
import {
  ENTERPRISE_CATEGORY_REPOSITORY,
  type EnterpriseCategoryRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise-category.repository';

@Injectable()
export class FindEnterpriseCategoryByIdUseCase {
  constructor(
    @Inject(ENTERPRISE_CATEGORY_REPOSITORY)
    private readonly repo: EnterpriseCategoryRepository,
  ) {}

  async execute(id: string): Promise<EnterpriseCategoryEntity> {
    const category = await this.repo.findById(id);
    if (!category) {
      throw new NotFoundException(
        `Enterprise category with id ${id} not found`,
      );
    }
    return category;
  }
}
