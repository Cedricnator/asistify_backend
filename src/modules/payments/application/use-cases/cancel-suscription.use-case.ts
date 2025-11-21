import { Inject, Injectable } from '@nestjs/common';
import { CreateSuscriptionCommand } from '../../domain/commands/create-suscription.command';
import { MembershipEntity } from 'src/modules/membership/domain/entities/membership.entity';
import { SUSCRIPTION_REPOSITORY, type SuscriptionRepository } from '../../domain/repositories/suscription.repository';
import { SuscriptionEntity } from '../../domain/entities/suscription.entity';
import { CancelSuscriptionCommand } from '../../domain/commands/cancel-suscription.command';


@Injectable()
export class CancelSuscriptionUseCase {
  constructor(
    @Inject(SUSCRIPTION_REPOSITORY)
    private readonly repository: SuscriptionRepository,
  ) {}

  execute(command: CancelSuscriptionCommand): Promise<string> {
    return this.repository.cancelSuscription(
      command.suscriptionId)
  }
}
