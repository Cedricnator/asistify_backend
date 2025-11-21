import { Inject, Injectable } from '@nestjs/common';
import { EnterpriseProfileEntity } from 'src/modules/enterprise/domain/entities/enterprise-profile.entity';
import {
  ENTERPRISE_PROFILE_REPOSITORY,
  type EnterpriseProfileRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise-profile.repository';

@Injectable()
export class FindEnterpriseProfilesByProfileUseCase {
  constructor(
    @Inject(ENTERPRISE_PROFILE_REPOSITORY)
    private readonly repo: EnterpriseProfileRepository,
  ) {}

  async execute(profileId: string): Promise<EnterpriseProfileEntity[]> {
    return await this.repo.findByProfile(profileId);
  }
}
