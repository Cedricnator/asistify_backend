import { PlanInterval } from "./plan-interval.entity";

export class PlanEntity {
  constructor(
        public readonly planId: string,
        public readonly planName: string,
        public readonly price:number,
        public readonly billingInterval:PlanInterval,
        public readonly currency:string,
        public readonly isActive:boolean=false,
        public readonly isPublic:boolean=false
  ) {}
}
