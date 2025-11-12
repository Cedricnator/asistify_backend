import { Inject, Injectable } from '@nestjs/common';
import { CreateEnterpriseCommand } from 'src/modules/enterprise/domain/commands/create-enterprise.command';
import { EnterpriseEntity } from 'src/modules/enterprise/domain/entities/enterprise.entity';
import {
  ENTERPRISE_REPOSITORY,
  type EnterpriseRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise.repository';

@Injectable()
export class CreateEnterpriseUseCase {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly repo: EnterpriseRepository,
  ) {}

  async execute(params: CreateEnterpriseCommand): Promise<EnterpriseEntity> {
    return await this.repo.create(params);
  }
}
