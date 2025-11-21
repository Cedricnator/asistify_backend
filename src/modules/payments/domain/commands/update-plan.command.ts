import { PlanInterval } from "../entities/plan-interval.entity";

export interface UpdatePlanCommand {
    planId: string,
    planName: string,
    description:string,
    price:number,
    billingInterval:PlanInterval,
    currency:string,
}
