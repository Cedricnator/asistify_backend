import { Inject, Injectable } from '@nestjs/common';

import { SUSCRIPTION_REPOSITORY, type SuscriptionRepository } from '../../domain/repositories/suscription.repository';

import { CreateCustomerCommand } from '../../domain/commands/create-customer.command';
import { ENTERPRISE_REPOSITORY, type EnterpriseRepository } from 'src/modules/enterprise/domain/repositories/enterprise.repository';
import { PROFILE_REPOSITORY, type ProfileRepository } from 'src/modules/profile/domain/repositories/profile.repository';


@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(SUSCRIPTION_REPOSITORY)
    private readonly repository: SuscriptionRepository,

    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository:EnterpriseRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository:ProfileRepository,
  ) {}

  async execute(command: CreateCustomerCommand): Promise<string> {
    let enterprise=await this.enterpriseRepository.findById(command.enterpriseId)
    
    let profile=await this.profileRepository.findById(command.profileId)

    if (enterprise==null || profile==null){
        return ""
    }
    return this.repository.createCustomer(
      command.enterpriseId,
      profile)
  }
}
