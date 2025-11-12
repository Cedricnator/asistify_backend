import { Module } from '@nestjs/common';
import { CreateEnterpriseUseCase } from './application/use-cases/enterprise/create-enterprise.use-case';
import { FindEnterprisesUseCase } from './application/use-cases/enterprise/find-enterprises.use-case';
import { FindEnterpriseByIdUseCase } from './application/use-cases/enterprise/find-enterprise-by-id.use-case';
import { UpdateEnterpriseUseCase } from './application/use-cases/enterprise/update-enterprise.use-case';
import { DeleteEnterpriseUseCase } from './application/use-cases/enterprise/delete-enterprise.use-case';
import { CreateEnterpriseCategoryUseCase } from './application/use-cases/enterprise-category/create-enterprise-category.use-case';
import { FindEnterpriseCategoriesUseCase } from './application/use-cases/enterprise-category/find-enterprise-categories.use-case';
import { FindEnterpriseCategoryByIdUseCase } from './application/use-cases/enterprise-category/find-enterprise-category-by-id.use-case';
import { ENTERPRISE_REPOSITORY } from './domain/repositories/enterprise.repository';
import { ENTERPRISE_CATEGORY_REPOSITORY } from './domain/repositories/enterprise-category.repository';
import { EnterprisePrismaRepository } from './infrastructure/prisma/enterprise.prisma.repository';
import { EnterpriseController } from './infrastructure/controllers/enterprise.controller';
import { EnterpriseCategoryController } from './infrastructure/controllers/enterprise-category.controller';
import { EnterpriseCategoryPrismaRepository } from './infrastructure/prisma/enterprise-category.prisma.repostory';

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

    {
      provide: ENTERPRISE_REPOSITORY,
      useClass: EnterprisePrismaRepository,
    },
    {
      provide: ENTERPRISE_CATEGORY_REPOSITORY,
      useClass: EnterpriseCategoryPrismaRepository,
    },
  ],
  controllers: [EnterpriseController, EnterpriseCategoryController],
})
export class EnterpriseModule {}
