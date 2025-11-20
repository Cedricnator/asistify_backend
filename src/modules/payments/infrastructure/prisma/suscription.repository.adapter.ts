import { PrismaService } from '../../../prisma/prisma.service';

import { Injectable } from '@nestjs/common';
import { SuscriptionRepository } from '../../domain/repositories/suscription.repository';
import { PaymentMethodEntity } from '../../domain/entities/payment-method.entity';
import { SuscriptionEntity } from '../../domain/entities/suscription.entity';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import { KVPair } from '../../domain/entities/kvpair.entity';
import { EnterpriseEntity } from 'src/modules/enterprise/domain/entities/enterprise.entity';
import { ProfileEntity } from 'src/modules/profile/domain/entities/profile.entity';
import { Membership } from '@prisma/client';
import { MembershipEntity } from 'src/modules/membership/domain/entities/membership.entity';


@Injectable()
export class SuscriptionRepositoryAdapter implements SuscriptionRepository {
  constructor(private readonly prisma: PrismaService) { }

  private FLOW_URL = "https://sandbox.flow.cl/api"
  private signParamsString(params: KVPair[]): string {
    let secret = process.env.FLOW_SECRET!
    let message = ""
    for (let index = 0; index < params.length; index++) {
      const param = params[index];
      message += `${param.key}${param.value}`
    }
    console.log("result to mac ", message)
    var sign = HmacSHA256(message, secret).toString()
    return sign
  }
  async createCustomer(
    enterprise: EnterpriseEntity,
    profile: ProfileEntity,
  ): Promise<string> {

    let apiKey = KVPair.ApiKey();
    let name = profile.name
    let email = profile.email
    let externalId = enterprise.id
    let params: KVPair[] = []
    params.push(apiKey)
    params.push(new KVPair("email", email))
    params.push(new KVPair("externalId", externalId))
    params.push(new KVPair("name", name))

    let s = this.signParamsString(params);
    const urlParams = new URLSearchParams({
      apiKey: apiKey.value,
      email,
      externalId,
      name,
      s
    })

    const res = await fetch(`${this.FLOW_URL}/customer/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlParams.toString(),
    })
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


    let s = this.signParamsString(params);
    const urlParams = new URLSearchParams({
      apiKey: apiKey.value,
      customerId: flowclientId,
      planId,
      s
    })

    const res = await fetch(`${this.FLOW_URL}/subscription/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlParams.toString(),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Request failed with ${res.status}: ${text}`);

    }
    const data = await res.json();
    let suscriptionId = data.subscriptionId
    let suscription = new SuscriptionEntity(suscriptionId, enterpriseId, membershipId, flowclientId,data.status==1,data.morose==0)
    return suscription;
  }




  async listSuscriptions(planId: string): Promise<SuscriptionEntity[]> {
    let params: KVPair[] = []
    let apiKey = KVPair.ApiKey()
    params.push(apiKey)
    params.push(new KVPair("planId", planId))
    let s = this.signParamsString(params);
    let baseUrl = `${this.FLOW_URL}/api/subscription/list`
    let urlParams = new URLSearchParams({
      apiKey: apiKey.value,
      planId,
      s
    }).toString();
    const fullUrl = `${baseUrl}?${urlParams}`;

    const res = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET failed with ${res.status}: ${text}`);
    }

    let data = await res.json()
    let subs: SuscriptionEntity[] = []
    data.data.forEach(rawSub => {
      //TODO: como encontrar el enterprise id...
      subs.push(new SuscriptionEntity(rawSub.subscriptionId,
        rawSub.customerId, rawSub.planExternalId,
        rawSub.customerId, rawSub.status == 1,
        rawSub.morose == 0))
    });

    return subs;
  }



  async getSuscription(subscriptionId: string,enterpriseId:string,flowClientId:string): Promise<SuscriptionEntity>{
    let params: KVPair[] = []
    let apiKey = KVPair.ApiKey()
    params.push(apiKey)
    params.push(new KVPair("subscriptionId", subscriptionId))
    let s = this.signParamsString(params);
    let baseUrl = `${this.FLOW_URL}/api/subscription/get`
    let urlParams = new URLSearchParams({
      apiKey: apiKey.value,
      subscriptionId,
      s
    }).toString();
    const fullUrl = `${baseUrl}?${urlParams}`;

    const res = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET failed with ${res.status}: ${text}`);
    }

    let data = await res.json()
    
    let suscription = new SuscriptionEntity(data.subscriptionId, enterpriseId, data.clientExternalId, flowClientId,data.status == 1,
        data.morose == 0)
    return suscription;
  }
  


  async cancelSuscription(subscriptionId: string): Promise<string> {
    let apiKey = KVPair.ApiKey();

    let params: KVPair[] = []
    params.push(apiKey)
    params.push(new KVPair("subscriptionId", subscriptionId))



    let s = this.signParamsString(params);
    const urlParams = new URLSearchParams({
      apiKey: apiKey.value,
      subscriptionId,
      s
    })

    const res = await fetch(`${this.FLOW_URL}/subscription/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlParams.toString(),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Request failed with ${res.status}: ${text}`);

    }
    const data = await res.json();
    let suscriptionId = data.subscriptionId
    return suscriptionId;
  }


}
