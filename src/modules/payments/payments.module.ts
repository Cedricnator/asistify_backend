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

@Module({
  controllers: [TestPaymentController],
  providers: [
    CreateCustomerUseCase,
CreateSuscriptionUseCase,
ListSuscriptionsUseCase,
GetSuscriptionUseCase,
CancelSuscriptionUseCase,
    {
      provide: ENTERPRISE_REPOSITORY,
      useClass: EnterprisePrismaRepository,
    },
    {
        provide:PROFILE_REPOSITORY,
        useClass:ProfilePrismaRepository
    },
    {
        provide:SUSCRIPTION_REPOSITORY,
        useClass:SuscriptionRepositoryAdapter
    },

  ],
  exports: [],
})
export class PaymentsModule {}
