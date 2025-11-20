import { Inject, Injectable } from '@nestjs/common';

import { SUSCRIPTION_REPOSITORY, type SuscriptionRepository } from '../../domain/repositories/suscription.repository';
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
