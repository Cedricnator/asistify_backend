import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseAuthRepository } from './infrastructure/supabase/supabase-auth.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UserController } from './infrastructure/controllers/user.controller';
import { FindUsersUseCase } from './application/use-cases/find-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { SupabaseAuthGuard } from './infrastructure/guards/supabase-auth.guard';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { PROFILE_REPOSITORY } from '../profile/domain/repositories/profile.repository';
import { ProfilePrismaRepository } from '../profile/infrastructure/prisma/profile.prisma.repository';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [SupabaseModule, ProfileModule],
  controllers: [UserController, AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    CreateUserUseCase,
    FindUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: USER_REPOSITORY,
      useClass: SupabaseAuthRepository,
    },
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfilePrismaRepository,
    },
  ],
  exports: [CreateUserUseCase],
})
export class AuthModule {}
