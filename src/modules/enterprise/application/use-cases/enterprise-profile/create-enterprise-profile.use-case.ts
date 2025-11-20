import { Inject, Injectable } from '@nestjs/common';
import { CreateEnterpriseProfileCommand } from 'src/modules/enterprise/domain/commands/create-enterprise-profile.command';
import { EnterpriseProfileEntity } from 'src/modules/enterprise/domain/entities/enterprise-profile.entity';
import {
  ENTERPRISE_PROFILE_REPOSITORY,
  type EnterpriseProfileRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise-profile.repository';

@Injectable()
export class CreateEnterpriseProfileUseCase {
  constructor(
    @Inject(ENTERPRISE_PROFILE_REPOSITORY)
    private readonly repo: EnterpriseProfileRepository,
  ) {}

  async execute(
    params: CreateEnterpriseProfileCommand,
  ): Promise<EnterpriseProfileEntity> {
    return await this.repo.create(params);
  }
}
