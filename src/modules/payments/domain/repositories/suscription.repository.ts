
import { SuscriptionEntity } from "../entities/suscription.entity";
import { ProfileEntity } from "src/modules/profile/domain/entities/profile.entity";


export const SUSCRIPTION_REPOSITORY = Symbol('SUSCRIPTION_REPOSITORY');

export interface SuscriptionRepository {
  createCustomer(
      enterpriseId: string,
      profile: ProfileEntity,
    ): Promise<string>
    
  createSuscription(
    flowClientId:string,membershipId:string, enterpriseId:string
  ): Promise<SuscriptionEntity>;
  listSuscriptions(planId: string):Promise<SuscriptionEntity[]>;
  getSuscription(subscriptionId: string): Promise<SuscriptionEntity>;
  getByEnterpriseId(enterpriseId: string): Promise<SuscriptionEntity|null>
  

  cancelSuscription(subscriptionId: string): Promise<string>;
}
