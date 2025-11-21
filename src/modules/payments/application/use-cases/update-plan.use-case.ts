import { forwardRef, Inject, Injectable } from '@nestjs/common';


import { PLAN_REPOSITORY, type PlanRepository } from '../../domain/repositories/plan.repository';
import { PlanEntity } from '../../domain/entities/plan.entity';
import { UpdatePlanCommand } from '../../domain/commands/update-plan.command';


@Injectable()
export class UpdatePlanUseCase {
  constructor(
    @Inject(forwardRef(()=>PLAN_REPOSITORY))
    private readonly repository: PlanRepository,
  ) {}

  execute(command: UpdatePlanCommand): Promise<PlanEntity> {
    return this.repository.updatePlan(
      command.planId,command.planName,
    command.description,command.price,command.billingInterval,command.currency)
  }
}
