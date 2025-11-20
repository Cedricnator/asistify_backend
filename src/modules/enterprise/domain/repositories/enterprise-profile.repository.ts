import { CreateEnterpriseProfileCommand } from '../commands/create-enterprise-profile.command';
import { DeleteEnterpriseProfileCommand } from '../commands/delete-enterprise-profile.command';
import { EnterpriseProfileEntity } from '../entities/enterprise-profile.entity';

export const ENTERPRISE_PROFILE_REPOSITORY = Symbol(
  'ENTERPRISE_PROFILE_REPOSITORY',
);

export interface EnterpriseProfileRepository {
  create(
    params: CreateEnterpriseProfileCommand,
  ): Promise<EnterpriseProfileEntity>;
  findByProfileAndEnterprise(
    profileId: string,
    enterpriseId: string,
  ): Promise<EnterpriseProfileEntity | null>;
  findByEnterprise(
    enterpriseId: string,
    page: number,
    limit: number,
  ): Promise<{ data: EnterpriseProfileEntity[]; total: number }>;
  findByProfile(profileId: string): Promise<EnterpriseProfileEntity[]>;
  delete(params: DeleteEnterpriseProfileCommand): Promise<void>;
}
