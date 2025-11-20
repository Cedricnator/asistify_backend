import { Inject, Injectable } from '@nestjs/common';
import { EnterpriseProfileEntity } from 'src/modules/enterprise/domain/entities/enterprise-profile.entity';
import {
  ENTERPRISE_PROFILE_REPOSITORY,
  type EnterpriseProfileRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise-profile.repository';

@Injectable()
export class FindEnterpriseProfilesByEnterpriseUseCase {
  constructor(
    @Inject(ENTERPRISE_PROFILE_REPOSITORY)
    private readonly repo: EnterpriseProfileRepository,
  ) {}

  async execute(
    enterpriseId: string,
    page: number,
    limit: number,
  ): Promise<{ data: EnterpriseProfileEntity[]; total: number }> {
    return await this.repo.findByEnterprise(enterpriseId, page, limit);
  }
}
