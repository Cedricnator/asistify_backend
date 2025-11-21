import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EnterpriseEntity } from 'src/modules/enterprise/domain/entities/enterprise.entity';
import {
  ENTERPRISE_REPOSITORY,
  type EnterpriseRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise.repository';

@Injectable()
export class FindEnterpriseByIdUseCase {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly repo: EnterpriseRepository,
  ) {}

  async execute(id: string): Promise<EnterpriseEntity> {
    const enterprise = await this.repo.findById(id);
    if (!enterprise) {
      throw new NotFoundException(`Enterprise with id ${id} not found`);
    }
    return enterprise;
  }
}
