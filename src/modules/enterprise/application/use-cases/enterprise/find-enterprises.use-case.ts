import { Inject, Injectable } from '@nestjs/common';
import { EnterpriseEntity } from 'src/modules/enterprise/domain/entities/enterprise.entity';
import {
  ENTERPRISE_REPOSITORY,
  type EnterpriseRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise.repository';

@Injectable()
export class FindEnterprisesUseCase {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly repo: EnterpriseRepository,
  ) {}

  async execute(): Promise<EnterpriseEntity[]> {
    return await this.repo.findAll();
  }
}
