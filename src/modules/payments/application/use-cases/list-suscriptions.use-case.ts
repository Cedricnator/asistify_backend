import { Inject, Injectable } from '@nestjs/common';
import { CreateSuscriptionCommand } from '../../domain/commands/create-suscription.command';
import { MembershipEntity } from 'src/modules/membership/domain/entities/membership.entity';
import { SUSCRIPTION_REPOSITORY, type SuscriptionRepository } from '../../domain/repositories/suscription.repository';
import { SuscriptionEntity } from '../../domain/entities/suscription.entity';
import { GetSuscriptionCommand } from '../../domain/commands/get-suscription.command';
import { ListSuscriptionsCommand } from '../../domain/commands/list-suscription.command';


@Injectable()
export class ListSuscriptionsUseCase {
  constructor(
    @Inject(SUSCRIPTION_REPOSITORY)
    private readonly repository: SuscriptionRepository,
  ) {}

  execute(command: ListSuscriptionsCommand): Promise<SuscriptionEntity[]> {
    return this.repository.listSuscriptions(
      command.planId)
  }
}
