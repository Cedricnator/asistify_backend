import { Module } from '@nestjs/common';

import { TestPaymentController } from './infrastructure/controllers/testpayment.controller';
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';
import { CreateSuscriptionUseCase } from './application/use-cases/create-suscription.use-case';
import { ListSuscriptionsUseCase } from './application/use-cases/list-suscriptions.use-case';
import { GetSuscriptionUseCase } from './application/use-cases/get-suscription.use-case';
import { CancelSuscriptionUseCase } from './application/use-cases/cancel-suscription.use-case';

import { SUSCRIPTION_REPOSITORY } from './domain/repositories/suscription.repository';
import { SuscriptionRepositoryAdapter } from './infrastructure/prisma/suscription.repository.adapter';
import { ENTERPRISE_REPOSITORY } from '../enterprise/domain/repositories/enterprise.repository';
import { EnterprisePrismaRepository } from '../enterprise/infrastructure/prisma/enterprise.prisma.repository';
import { PROFILE_REPOSITORY } from '../profile/domain/repositories/profile.repository';
import { ProfilePrismaRepository } from '../profile/infrastructure/prisma/profile.prisma.repository';
import { PLAN_REPOSITORY } from './domain/repositories/plan.repository';
import { PlanRepositoryAdapter } from './infrastructure/prisma/plan.repository.adapter';
import { PlansController } from './infrastructure/controllers/plans.controller';
import { CreatePlanUseCase } from './application/use-cases/create-plan.use-case';
import { UpdatePlanUseCase } from './application/use-cases/update-plan.use-case';
import { ListPlansUseCase } from './application/use-cases/list-plans.use-case';
import { GetPlanUseCase } from './application/use-cases/get-plan.use-case';
import { RequiresSuscriptionGuard } from './infrastructure/middleware/requires-suscription.guard';

@Module({
  controllers: [TestPaymentController, PlansController],
  providers: [
    CreateCustomerUseCase,
    CreateSuscriptionUseCase,
    ListSuscriptionsUseCase,
    GetSuscriptionUseCase,
    CancelSuscriptionUseCase,
    CreatePlanUseCase,
    UpdatePlanUseCase,
    ListPlansUseCase,
    GetPlanUseCase,
    RequiresSuscriptionGuard,
    {
      provide: ENTERPRISE_REPOSITORY,
      useClass: EnterprisePrismaRepository,
    },
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfilePrismaRepository
    },
    {
      provide: SUSCRIPTION_REPOSITORY,
      useClass: SuscriptionRepositoryAdapter
    },
    {
      provide: PLAN_REPOSITORY,
      useClass: PlanRepositoryAdapter
    }

  ],
  exports: [RequiresSuscriptionGuard],
})
export class PaymentsModule {}
