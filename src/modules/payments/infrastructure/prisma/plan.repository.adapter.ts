import { PrismaService } from '../../../prisma/prisma.service';

import { Injectable, Logger } from '@nestjs/common';

import { KVPair } from '../../domain/entities/kvpair.entity';

import { FlowRepositoryAdapter } from '../pagosflow/flow.repository.adapter';
import { PlanEntity } from '../../domain/entities/plan.entity';
import { PlanInterval } from '../../domain/entities/plan-interval.entity';
import { PlanRepository } from '../../domain/repositories/plan.repository';


@Injectable()
export class PlanRepositoryAdapter implements PlanRepository {
  private readonly logger=new Logger(PlanRepositoryAdapter.name)
  private readonly flow=new FlowRepositoryAdapter();
  constructor(private readonly prisma: PrismaService) { }

  
  async createPlan(
    planId: string,
    planName: string,
    description:string,
    price:number,
    billingInterval:PlanInterval=PlanInterval.MONTHLY,
    currency:string="CLP"
  ): Promise<PlanEntity> {

    let apiKey = KVPair.ApiKey();
    
    let params: KVPair[] = []
    params.push(new KVPair("amount", price.toString()))
    params.push(apiKey)
    params.push(new KVPair("currency", currency))
    params.push(new KVPair("interval", billingInterval.valueOf().toString()))
    params.push(new KVPair("name", planName))
    params.push(new KVPair("planId", planId))
    


    
    const res= await this.flow.post("/api/plans/create",params)
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Request failed with ${res.status}: ${text}`);
    }

    const data = await res.json();
    let planToSave=new PlanEntity(planId,planName,price,billingInterval,currency,data.status==1,data.public==1)
    let saved=await this.prisma.membership.create({
        data:{
            id:planId,
            name:planName,
            price,
            description
            
        }
    })
    return planToSave


  }

  async updatePlan(
        planId: string,
        planName: string,
        description:string,
        price:number,
        billingInterval:PlanInterval=PlanInterval.MONTHLY,
        currency:string="CLP"): Promise<PlanEntity> {
    let apiKey = KVPair.ApiKey();
    let params: KVPair[] = []

    params.push(new KVPair("amount", price.toString()))
    params.push(apiKey)
    params.push(new KVPair("currency", currency))
    params.push(new KVPair("interval", billingInterval.valueOf().toString()))
    params.push(new KVPair("name", planName))
    params.push(new KVPair("planId", planId))


    

    const res = await this.flow.post("/api/plans/edit",params)
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Request failed with ${res.status}: ${text}`);

    }
    const data = await res.json();
    let planToUpdate=new PlanEntity(planId,planName,price,billingInterval,currency,data.status==1,data.public==1)
    let saved=await this.prisma.membership.update({
        where:{
            id:planId,

        },data:{
            name:planName,
            price,
            description
        }
    })
    return planToUpdate
  }




  async listPlans(): Promise<PlanEntity[]> {
    let params: KVPair[] = []
    let apiKey = KVPair.ApiKey()
    params.push(apiKey)
    
    const res = await this.flow.get("/api/plans/list",params);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET failed with ${res.status}: ${text}`);
    }

    let data = await res.json()
    let plans: PlanEntity[] = []
    let savedSubs=await this.prisma.subscription.findMany()
    this.logger.log(`plans list: ${JSON.stringify(data)}`)
    data.data.forEach(rawPlan => {
      //TODO: como encontrar el enterprise id...
      
      plans.push(new PlanEntity(rawPlan.planId,
        rawPlan.name,rawPlan.amount,rawPlan.interval,rawPlan.currency,rawPlan.status==1,rawPlan.public==1))
    });

    return plans;
  }
  



  async getPlan(planId:string): Promise<PlanEntity>{
    let params: KVPair[] = []
    let apiKey = KVPair.ApiKey()
    params.push(apiKey)
    params.push(new KVPair("planId", planId))
    

    const res = await this.flow.get("/api/plans/get",params);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET failed with ${res.status}: ${text}`);
    }

    let data = await res.json()
    
    let plan = new PlanEntity(planId,data.name,data.amount,data.interval,data.currency,data.status==1,data.public==1)
    return plan;
  }
  


  async cancelSuscription(subscriptionId: string): Promise<string> {
    let apiKey = KVPair.ApiKey();

    let params: KVPair[] = []
    params.push(apiKey)
    params.push(new KVPair("subscriptionId", subscriptionId))




    const res = await this.flow.post("/subscription/cancel",params)
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Request failed with ${res.status}: ${text}`);

    }
    const data = await res.json();
    let suscriptionId = data.subscriptionId
    return suscriptionId;
  }


}
