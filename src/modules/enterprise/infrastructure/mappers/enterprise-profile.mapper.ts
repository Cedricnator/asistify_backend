import { EnterpriseProfile } from '@prisma/client';
import { EnterpriseProfileEntity } from '../../domain/entities/enterprise-profile.entity';
import { CreateEnterpriseProfileCommand } from '../../domain/commands/create-enterprise-profile.command';

interface CreateEnterpriseProfileData {
  profile_id: string;
  enterprise_id: string;
  is_owner: boolean;
}

export class EnterpriseProfileMapper {
  static toDomain(raw: EnterpriseProfile): EnterpriseProfileEntity {
    return new EnterpriseProfileEntity(
      raw.id,
      raw.profile_id,
      raw.enterprise_id,
      raw.is_owner,
      raw.created_at,
      raw.updated_at,
    );
  }

  static toCreate(
    params: CreateEnterpriseProfileCommand,
  ): CreateEnterpriseProfileData {
    return {
      profile_id: params.profileId,
      enterprise_id: params.enterpriseId,
      is_owner: params.isOwner,
    };
  }
}
