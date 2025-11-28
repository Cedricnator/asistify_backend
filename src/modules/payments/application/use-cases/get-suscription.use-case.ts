import { Inject, Injectable } from '@nestjs/common';
import { CreateSuscriptionCommand } from '../../domain/commands/create-suscription.command';
import { MembershipEntity } from 'src/modules/membership/domain/entities/membership.entity';
import { SUSCRIPTION_REPOSITORY, type SuscriptionRepository } from '../../domain/repositories/suscription.repository';
import { SuscriptionEntity } from '../../domain/entities/suscription.entity';
import { GetSuscriptionCommand } from '../../domain/commands/get-suscription.command';


@Injectable()
export class GetSuscriptionUseCase {
  constructor(
    @Inject(SUSCRIPTION_REPOSITORY)
    private readonly repository: SuscriptionRepository,
  ) {}

  execute(command: GetSuscriptionCommand): Promise<SuscriptionEntity> {
    return this.repository.getSuscription(
      command.suscriptionId,
      )
  }
}
