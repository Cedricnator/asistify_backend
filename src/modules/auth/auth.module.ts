import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseAuthRepository } from './infrastructure/supabase/supabase-auth.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { FindUsersUseCase } from './application/use-cases/find-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { SupabaseAuthGuard } from './infrastructure/guards/supabase-auth.guard';

@Module({
  imports: [SupabaseModule],
  controllers: [AuthController],
  providers: [
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
  ],
})
export class AuthModule {}
