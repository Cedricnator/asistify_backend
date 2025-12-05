import { CanActivate, ExecutionContext, ForbiddenException, HttpException, Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { SUSCRIPTION_REPOSITORY, type SuscriptionRepository } from "../../domain/repositories/suscription.repository";
import { PaymentRequiredException } from "./payment-exception.exception";

@Injectable()
export class RequiresSuscriptionGuard implements CanActivate {
  constructor(
    @Inject(SUSCRIPTION_REPOSITORY)
    private suscriptionRepository:SuscriptionRepository) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest(); 

    console.log("subscription check!")
    const suscription = await this.suscriptionRepository.getByEnterpriseId(req.user.app_metadata.enterprise_id)

    let suscriptionExists=suscription!=null
    if (suscriptionExists){
      let isSuscriptionActive=suscription!.active
      let isSuscriptionPaid=suscription!.paid
      if (isSuscriptionActive&&isSuscriptionPaid){
        return true
      }
      else{
        throw new PaymentRequiredException("pay subscription please")
      }
    }
    

    throw new PaymentRequiredException("pay subscription please")
    return false
  }
}