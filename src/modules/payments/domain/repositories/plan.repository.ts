import { PlanInterval } from "../entities/plan-interval.entity";
import { PlanEntity } from "../entities/plan.entity";



export const PLAN_REPOSITORY = Symbol('PLAN_REPOSITORY');

export interface PlanRepository {
  createPlan(
      planId: string,
      planName: string,
      description:string,
      price:number,
      billingInterval:PlanInterval,
      currency:string
    ): Promise<PlanEntity>
    
  updatePlan(
      planId:string,
      planName: string,
      description:string,
      price:number,
      billingInterval:PlanInterval,
      currency:string):Promise<PlanEntity>
  listPlans():Promise<PlanEntity[]>;
  getPlan(planId:string): Promise<PlanEntity>;
  

  
}
