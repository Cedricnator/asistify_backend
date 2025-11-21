import { forwardRef, Inject, Injectable } from '@nestjs/common';


import { PLAN_REPOSITORY, type PlanRepository } from '../../domain/repositories/plan.repository';
import { PlanEntity } from '../../domain/entities/plan.entity';
import { GetPlanCommand } from '../../domain/commands/get-plan.command';



@Injectable()
export class GetPlanUseCase {
  constructor(
    @Inject(forwardRef(()=>PLAN_REPOSITORY))
    private readonly repository: PlanRepository,
  ) {}

  execute(command:GetPlanCommand): Promise<PlanEntity> {
    return this.repository.getPlan(command.planId)
  }
}
