import { EnterpriseCategory } from '@prisma/client';
import { EnterpriseCategoryEntity } from '../../domain/entities/enterprise-category.entity';
import { CreateEnterpriseCategoryCommand } from '../../domain/commands/create-enterprise-category.command';

interface CreateEnterpriseCategoryData {
  name: string;
  description?: string;
}

export class EnterpriseCategoryMapper {
  static toDomain(raw: EnterpriseCategory): EnterpriseCategoryEntity {
    return new EnterpriseCategoryEntity(
      raw.id,
      raw.name,
      raw.created_at,
      raw.updated_at,
      raw.description,
    );
  }

  static toCreate(
    params: CreateEnterpriseCategoryCommand,
  ): CreateEnterpriseCategoryData {
    return {
      name: params.name,
      description: params.description,
    };
  }

  static toDomainArray(raws: EnterpriseCategory[]): EnterpriseCategoryEntity[] {
    return raws.map((raw) => this.toDomain(raw));
  }
}
