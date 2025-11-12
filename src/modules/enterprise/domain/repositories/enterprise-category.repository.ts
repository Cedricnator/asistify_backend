import { CreateEnterpriseCategoryCommand } from '../commands/create-enterprise-category.command';
import { EnterpriseCategoryEntity } from '../entities/enterprise-category.entity';

export const ENTERPRISE_CATEGORY_REPOSITORY = Symbol(
  'ENTERPRISE_CATEGORY_REPOSITORY',
);

export interface EnterpriseCategoryRepository {
  create(
    params: CreateEnterpriseCategoryCommand,
  ): Promise<EnterpriseCategoryEntity>;
  findAll(): Promise<EnterpriseCategoryEntity[]>;
  findById(id: string): Promise<EnterpriseCategoryEntity | null>;
}
