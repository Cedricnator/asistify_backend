import { Inject, Injectable } from '@nestjs/common';
import { CreateEnterpriseProfileCommand } from 'src/modules/enterprise/domain/commands/create-enterprise-profile.command';
import { EnterpriseProfileEntity } from 'src/modules/enterprise/domain/entities/enterprise-profile.entity';
import {
  ENTERPRISE_PROFILE_REPOSITORY,
  type EnterpriseProfileRepository,
} from 'src/modules/enterprise/domain/repositories/enterprise-profile.repository';
import { SUSCRIPTION_REPOSITORY, type SuscriptionRepository } from 'src/modules/payments/domain/repositories/suscription.repository';
import { FindProfileByIdUseCase } from 'src/modules/profile/application/use-cases/profile/find-profile-by-id.use-case';

@Injectable()
export class CreateEnterpriseProfileUseCase {
  constructor(
    @Inject(ENTERPRISE_PROFILE_REPOSITORY)
    private readonly repo: EnterpriseProfileRepository,
    @Inject(SUSCRIPTION_REPOSITORY)
    private readonly suscriptionRepository:SuscriptionRepository,

    private findProfileById:FindProfileByIdUseCase
  ) {}

  async execute(
    params: CreateEnterpriseProfileCommand,
  ): Promise<EnterpriseProfileEntity> {
    let enterprise=await this.repo.create(params);
  
    if (params.isOwner){
      let profile=await this.findProfileById.execute(params.profileId)
      let customerId = await this.suscriptionRepository.createCustomer(enterprise.id,profile)
      let suscription=await this.suscriptionRepository.createSuscription(customerId,params.membershipId!,enterprise.id)
    }
    
    return enterprise
  }
}
