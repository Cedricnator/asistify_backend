import { Inject, Injectable } from '@nestjs/common';
import { CreateSuscriptionCommand } from '../../domain/commands/create-suscription.command';
import { MembershipEntity } from 'src/modules/membership/domain/entities/membership.entity';
import { SUSCRIPTION_REPOSITORY, type SuscriptionRepository } from '../../domain/repositories/suscription.repository';
import { SuscriptionEntity } from '../../domain/entities/suscription.entity';


@Injectable()
export class CreateSuscriptionUseCase {
  constructor(
    @Inject(SUSCRIPTION_REPOSITORY)
    private readonly repository: SuscriptionRepository,
  ) {}

  execute(command: CreateSuscriptionCommand): Promise<SuscriptionEntity> {
    return this.repository.createSuscription(
      command.flowclientId,
      command.membershipId,
      command.enterpriseId,)
  }
}
