import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { CreatePlanCommand } from '../../domain/commands/create-plan.command';
import { PLAN_REPOSITORY, type PlanRepository } from '../../domain/repositories/plan.repository';
import { PlanEntity } from '../../domain/entities/plan.entity';


@Injectable()
export class CreatePlanUseCase {
  constructor(
    @Inject(forwardRef(()=>PLAN_REPOSITORY))
    private readonly repository: PlanRepository,
  ) {}

  execute(command: CreatePlanCommand): Promise<PlanEntity> {
    return this.repository.createPlan(
      command.planId,command.planName,
    command.description,command.price,command.billingInterval,command.currency)
  }
}
