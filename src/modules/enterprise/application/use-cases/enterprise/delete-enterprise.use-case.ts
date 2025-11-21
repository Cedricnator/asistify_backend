import { Inject, Injectable } from '@nestjs/common';
import {
  ENTERPRISE_REPOSITORY,
  type EnterpriseRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise.repository';

@Injectable()
export class DeleteEnterpriseUseCase {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly repo: EnterpriseRepository,
  ) {}

  async execute(id: string): Promise<void> {
    return await this.repo.delete(id);
  }
}
