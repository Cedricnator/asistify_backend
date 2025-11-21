import { forwardRef, Inject, Injectable } from '@nestjs/common';


import { PLAN_REPOSITORY, type PlanRepository } from '../../domain/repositories/plan.repository';
import { PlanEntity } from '../../domain/entities/plan.entity';



@Injectable()
export class ListPlansUseCase {
  constructor(
    @Inject(forwardRef(()=>PLAN_REPOSITORY))
    private readonly repository: PlanRepository,
  ) {}

  execute(): Promise<PlanEntity[]> {
    return this.repository.listPlans()
  }
}
