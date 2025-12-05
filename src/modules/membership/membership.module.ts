import { Module } from '@nestjs/common';
import { MembershipController } from './infrastructure/controller/membership.controller';
import { ListAllMembershipsUseCase } from './application/use-cases/list-all-memberships.use-case';
import { MEMBERSHIP_REPOSITORY } from './domain/repositories/membership.repository';
import { MembershipRepositoryAdapter } from './infrastructure/prisma/membership.repository.adapter';
import { CreateMembershipUseCase } from './application/use-cases/create-membership.use-case';
import { DeleteMembershipUseCase } from './application/use-cases/delete-membership.use-case';

@Module({
  controllers: [MembershipController],
  providers: [
    ListAllMembershipsUseCase,
    CreateMembershipUseCase,
    DeleteMembershipUseCase,
    {
      provide: MEMBERSHIP_REPOSITORY,
      useClass: MembershipRepositoryAdapter,
    },
  ],
  exports: [
    ListAllMembershipsUseCase,
    CreateMembershipUseCase,
    DeleteMembershipUseCase,
  ],
})
export class MembershipModule {}
