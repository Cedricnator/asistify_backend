import { Enterprise } from '@prisma/client';
import { EnterpriseEntity } from '../../domain/entities/enterprise.entity';
import { CreateEnterpriseCommand } from '../../domain/commands/create-enterprise.command';
import { UpdateEnterpriseCommand } from '../../domain/commands/update-enterprise.command';

interface CreateEnterpriseData {
  name: string;
  category_id: string;
  subscription_id?: string;
}

interface UpdateEnterpriseData {
  name?: string;
  category_id?: string;
  subscription_id?: string;
}

export class EnterpriseMapper {
  static toDomain(raw: Enterprise): EnterpriseEntity {
    return new EnterpriseEntity(
      raw.id,
      raw.name,
      raw.created_at,
      raw.updated_at,
      raw.category_id,
      raw.subscription_id,
    );
  }

  static toCreate(params: CreateEnterpriseCommand): CreateEnterpriseData {
    return {
      name: params.name,
      category_id: params.categoryId,
      subscription_id: params.subscriptionId,
    };
  }

  static toUpdate(params: UpdateEnterpriseCommand): UpdateEnterpriseData {
    const data: UpdateEnterpriseData = {};
    if (params.name !== undefined) data.name = params.name;
    if (params.categoryId !== undefined) data.category_id = params.categoryId;
    if (params.subscriptionId !== undefined)
      data.subscription_id = params.subscriptionId;
    return data;
  }
}
