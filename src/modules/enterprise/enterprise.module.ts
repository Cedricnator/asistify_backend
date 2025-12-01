import { Module } from '@nestjs/common';
import { CreateEnterpriseUseCase } from './application/use-cases/enterprise/create-enterprise.use-case';
import { FindEnterprisesUseCase } from './application/use-cases/enterprise/find-enterprises.use-case';
import { FindEnterpriseByIdUseCase } from './application/use-cases/enterprise/find-enterprise-by-id.use-case';
import { UpdateEnterpriseUseCase } from './application/use-cases/enterprise/update-enterprise.use-case';
import { DeleteEnterpriseUseCase } from './application/use-cases/enterprise/delete-enterprise.use-case';
import { CreateEnterpriseCategoryUseCase } from './application/use-cases/enterprise-category/create-enterprise-category.use-case';
import { FindEnterpriseCategoriesUseCase } from './application/use-cases/enterprise-category/find-enterprise-categories.use-case';
import { FindEnterpriseCategoryByIdUseCase } from './application/use-cases/enterprise-category/find-enterprise-category-by-id.use-case';
import { CreateEnterpriseProfileUseCase } from './application/use-cases/enterprise-profile/create-enterprise-profile.use-case';
import { FindEnterpriseProfilesByEnterpriseUseCase } from './application/use-cases/enterprise-profile/find-enterprise-profiles-by-enterprise.use-case';
import { FindEnterpriseProfilesByProfileUseCase } from './application/use-cases/enterprise-profile/find-enterprise-profiles-by-profile.use-case';
import { DeleteEnterpriseProfileUseCase } from './application/use-cases/enterprise-profile/delete-enterprise-profile.use-case';
import { ENTERPRISE_REPOSITORY } from './domain/repositories/enterprise.repository';
import { ENTERPRISE_CATEGORY_REPOSITORY } from './domain/repositories/enterprise-category.repository';
import { ENTERPRISE_PROFILE_REPOSITORY } from './domain/repositories/enterprise-profile.repository';
import { EnterprisePrismaRepository } from './infrastructure/prisma/enterprise.prisma.repository';
import { EnterpriseController } from './infrastructure/controllers/enterprise.controller';
import { EnterpriseCategoryController } from './infrastructure/controllers/enterprise-category.controller';
import { EnterpriseProfileController } from './infrastructure/controllers/enterprise-profile.controller';
import { EnterpriseCategoryPrismaRepository } from './infrastructure/prisma/enterprise-category.prisma.repostory';
import { EnterpriseProfilePrismaRepository } from './infrastructure/prisma/enterprise-profile.prisma.repository';
import { ProfileModule } from '../profile/profile.module';
import { SUSCRIPTION_REPOSITORY } from '../payments/domain/repositories/suscription.repository';
import { SuscriptionRepositoryAdapter } from '../payments/infrastructure/prisma/suscription.repository.adapter';

@Module({
  providers: [
    CreateEnterpriseUseCase,
    FindEnterprisesUseCase,
    FindEnterpriseByIdUseCase,
    UpdateEnterpriseUseCase,
    DeleteEnterpriseUseCase,

    CreateEnterpriseCategoryUseCase,
    FindEnterpriseCategoriesUseCase,
    FindEnterpriseCategoryByIdUseCase,

    CreateEnterpriseProfileUseCase,
    FindEnterpriseProfilesByEnterpriseUseCase,
    FindEnterpriseProfilesByProfileUseCase,
    DeleteEnterpriseProfileUseCase,

    {
      provide: ENTERPRISE_REPOSITORY,
      useClass: EnterprisePrismaRepository,
    },
    {
      provide: ENTERPRISE_CATEGORY_REPOSITORY,
      useClass: EnterpriseCategoryPrismaRepository,
    },
    {
      provide: ENTERPRISE_PROFILE_REPOSITORY,
      useClass: EnterpriseProfilePrismaRepository,
    },
    {
      provide: SUSCRIPTION_REPOSITORY,
      useClass: SuscriptionRepositoryAdapter,
    },
  ],
  controllers: [
    EnterpriseController,
    EnterpriseCategoryController,
    EnterpriseProfileController,
  ],
  imports: [ProfileModule],
})
export class EnterpriseModule {}
