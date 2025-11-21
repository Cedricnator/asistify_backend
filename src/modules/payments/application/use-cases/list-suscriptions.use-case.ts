import { Inject, Injectable } from '@nestjs/common';

import { SUSCRIPTION_REPOSITORY, type SuscriptionRepository } from '../../domain/repositories/suscription.repository';
import { SuscriptionEntity } from '../../domain/entities/suscription.entity';

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
