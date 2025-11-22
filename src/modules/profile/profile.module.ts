import { Module } from '@nestjs/common';
import { CreateProfileUseCase } from './application/use-cases/profile/create-profile.use-case';
import { FindProfileByIdUseCase } from './application/use-cases/profile/find-profile-by-id.use-case';
import { FindProfileByEmailUseCase } from './application/use-cases/profile/find-profile-by-email.use-case';
import { UpdateProfileUseCase } from './application/use-cases/profile/update-profile.use-case';
import { FindRolesUseCase } from './application/use-cases/role/find-roles.use-case';
import { FindRoleByIdUseCase } from './application/use-cases/role/find-role-by-id.use-case';
import { PROFILE_REPOSITORY } from './domain/repositories/profile.repository';
import { ProfilePrismaRepository } from './infrastructure/prisma/profile.prisma.repository';
import { RolePrismRepository } from './infrastructure/prisma/role.prisma.repository';
import { ROLE_REPOSITORY } from './domain/repositories/role.repository';
import { ProfileController } from './infrastructure/controllers/profile.controller';
import { RoleController } from './infrastructure/controllers/role.controller';

@Module({
  providers: [
    CreateProfileUseCase,
    FindProfileByIdUseCase,
    FindProfileByEmailUseCase,
    UpdateProfileUseCase,

    FindRolesUseCase,
    FindRoleByIdUseCase,
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfilePrismaRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RolePrismRepository,
    },
  ],
  controllers: [ProfileController, RoleController],
  exports: [
    CreateProfileUseCase,
    FindProfileByIdUseCase,
    FindProfileByEmailUseCase,
  ],
})
export class ProfileModule {}
