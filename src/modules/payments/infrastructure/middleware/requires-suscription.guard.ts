import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { SUSCRIPTION_REPOSITORY, type SuscriptionRepository } from "../../domain/repositories/suscription.repository";

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
      return isSuscriptionActive&&isSuscriptionPaid
    }

    throw new ForbiddenException("pay subscription please")
    return false
  }
}