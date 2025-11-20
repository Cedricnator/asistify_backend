import { Inject, Injectable } from '@nestjs/common';
import { DeleteEnterpriseProfileCommand } from 'src/modules/enterprise/domain/commands/delete-enterprise-profile.command';
import {
  ENTERPRISE_PROFILE_REPOSITORY,
  type EnterpriseProfileRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise-profile.repository';

@Injectable()
export class DeleteEnterpriseProfileUseCase {
  constructor(
    @Inject(ENTERPRISE_PROFILE_REPOSITORY)
    private readonly repo: EnterpriseProfileRepository,
  ) {}

  async execute(params: DeleteEnterpriseProfileCommand): Promise<void> {
    return await this.repo.delete(params);
  }
}
