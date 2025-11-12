import { Inject, Injectable } from '@nestjs/common';
import { UpdateEnterpriseCommand } from 'src/modules/enterprise/domain/commands/update-enterprise.command';
import { EnterpriseEntity } from 'src/modules/enterprise/domain/entities/enterprise.entity';
import {
  ENTERPRISE_REPOSITORY,
  type EnterpriseRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise.repository';

@Injectable()
export class UpdateEnterpriseUseCase {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly repo: EnterpriseRepository,
  ) {}

  async execute(params: UpdateEnterpriseCommand): Promise<EnterpriseEntity> {
    return await this.repo.update(params);
  }
}
