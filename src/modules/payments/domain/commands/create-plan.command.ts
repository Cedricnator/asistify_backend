import { PlanInterval } from "../entities/plan-interval.entity";


export interface CreatePlanCommand {
    planId: string,
    planName: string,
    description:string,
    price:number,
    billingInterval:PlanInterval,
    currency:string,
}
