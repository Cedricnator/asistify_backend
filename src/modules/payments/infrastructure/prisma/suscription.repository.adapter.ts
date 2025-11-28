import { PrismaService } from '../../../prisma/prisma.service';

import { Injectable, Logger } from '@nestjs/common';
import { SuscriptionRepository } from '../../domain/repositories/suscription.repository';

import { SuscriptionEntity } from '../../domain/entities/suscription.entity';

import { KVPair } from '../../domain/entities/kvpair.entity';

import { ProfileEntity } from 'src/modules/profile/domain/entities/profile.entity';

import { FlowRepositoryAdapter } from '../pagosflow/flow.repository.adapter';


@Injectable()
export class SuscriptionRepositoryAdapter implements SuscriptionRepository {
  private readonly logger=new Logger(SuscriptionRepositoryAdapter.name)
  private readonly flow=new FlowRepositoryAdapter();
  constructor(private readonly prisma: PrismaService) { }

  
  async createCustomer(
    enterpriseId:string,
    profile: ProfileEntity,
  ): Promise<string> {

    let apiKey = KVPair.ApiKey();
    let name = profile.name
    let email = profile.email
    let externalId = enterpriseId
    let params: KVPair[] = []
    params.push(apiKey)
    params.push(new KVPair("email", email))
    params.push(new KVPair("externalId", externalId))
    params.push(new KVPair("name", name))

    
    const res= await this.flow.post("/customer/create",params)
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Request failed with ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.customerId


  }

  async createSuscription(flowclientId: string, membershipId: string, enterpriseId: string): Promise<SuscriptionEntity> {
    let apiKey = KVPair.ApiKey();
    let planId = membershipId
    let params: KVPair[] = []
    params.push(apiKey)
    params.push(new KVPair("customerId", flowclientId))
    params.push(new KVPair("planId", membershipId))


    

    const res = await this.flow.post("/subscription/create",params)
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Request failed with ${res.status}: ${text}`);

    }
    const data = await res.json();
    let suscriptionId :string = data.subscriptionId
    let suscription = new SuscriptionEntity(suscriptionId, enterpriseId, membershipId, flowclientId,data.status==1,data.morose==0)
    let currentDate=new Date()
    let endDate=new Date()
    endDate.setMonth((currentDate.getMonth()+1)%13)
    this.logger.log(`handmade suscription ${JSON.stringify(suscription)}`)
    let prismaSus=await this.prisma.subscription.create({
      data:{
        
        mounth_duration:1,
        start_date:currentDate,
        end_date: endDate,
        enterprise_id: enterpriseId,
        membership_id: membershipId,
        flow_id:suscriptionId
      }
    })
    this.logger.log(`prisma suscription ${JSON.stringify(prismaSus)}`)
    return suscription;
  }




  async listSuscriptions(planId: string): Promise<SuscriptionEntity[]> {
    let params: KVPair[] = []
    let apiKey = KVPair.ApiKey()
    params.push(apiKey)
    params.push(new KVPair("planId", planId))
    

    const res = await this.flow.get("/api/subscription/list",params);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET failed with ${res.status}: ${text}`);
    }

    let data = await res.json()
    let subs: SuscriptionEntity[] = []
    let savedSubs=await this.prisma.subscription.findMany()
    data.data.forEach(rawSub => {
      //TODO: como encontrar el enterprise id...
      let savedSub=savedSubs.find((sub)=>sub.flow_id==rawSub.subscriptionId);
      subs.push(new SuscriptionEntity(rawSub.subscriptionId,
        savedSub?.enterprise_id??"", rawSub.planExternalId,
        rawSub.customerId, rawSub.status == 1,
        rawSub.morose == 0))
    });

    return subs;
  }



  async getSuscription(subscriptionId: string): Promise<SuscriptionEntity>{
    let params: KVPair[] = []
    let apiKey = KVPair.ApiKey()
    params.push(apiKey)
    params.push(new KVPair("subscriptionId", subscriptionId))
    

    const res = await this.flow.get("/api/subscription/get",params);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET failed with ${res.status}: ${text}`);
    }

    let data = await res.json()
    let prismaData=await this.prisma.subscription.findFirst({where:{flow_id:subscriptionId}})
    let suscription = new SuscriptionEntity(data.subscriptionId, prismaData?.enterprise_id??"", prismaData?.membership_id!, prismaData?.flow_id??"",data.status == 1,
        data.morose == 0)
    return suscription;
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
