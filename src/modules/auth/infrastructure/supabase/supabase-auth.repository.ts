import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthError, SupabaseClient, User } from '@supabase/supabase-js';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { SUPABASE_CLIENT } from 'src/modules/supabase/supabase.module';

@Injectable()
export class SupabaseAuthRepository implements UserRepository {
  private readonly logger = new Logger(SupabaseAuthRepository.name);
  private readonly env: string;

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly client: SupabaseClient,
    private readonly config: ConfigService,
  ) {
    this.env = this.config.get<string>('env.nodeEnv', 'local');
  }

  private shouldSkip(): boolean {
    if (this.env === 'local' || this.env === 'test') {
      return true;
    }
    return false;
  }

  private handleError(error: AuthError) {
    this.logger.error('Error creating user in Supabase', {
      message: error.message,
    });
    throw error;
  }

  private mapUser(u: User): UserEntity {
    return new UserEntity(u.id, u.email ?? '', u.user_metadata?.name as string);
  }

  async refreshSession(
    currentRefreshToken: string,
  ): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    if (this.shouldSkip()) {
      return {
        user: new UserEntity(
          'local-id',
          'refreshed@test.com',
          'Refreshed User',
        ),
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token',
      };
    }

    const { data, error } = await this.client.auth.refreshSession({
      refresh_token: currentRefreshToken,
    });

    if (error || !data.user || !data.session) {
      this.logger.warn(`Refresh token failed: ${error?.message}`);
      // Si falla (token expirado o revocado), lanzamos 401.
      // El frontend debe atrapar esto y redirigir al login.
      throw new UnauthorizedException('Sesión expirada o inválida');
    }

    // Es vital devolver el nuevo refresh_token también,
    // porque el anterior ya no servirá (Token Rotation).
    return {
      user: this.mapUser(data.user),
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async login(params: {
    email: string;
    password: string;
  }): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    if (this.shouldSkip()) {
      // Async functions automatically wrap returns in Promise
      return {
        user: new UserEntity('local-id', params.email, 'Local User'),
        accessToken: 'mock-access',
        refreshToken: 'mock-refresh',
      };
    }

    const { data, error } = await this.client.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });

    if (error) throw new UnauthorizedException(error.message);

    return {
      user: this.mapUser(data.user),
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async register(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    await this.createUser(params.email, params.password, params.name);
    return this.login({ email: params.email, password: params.password });
  }

  async createUser(
    email: string,
    password: string,
    name: string,
  ): Promise<UserEntity> {
    if (this.shouldSkip()) {
      return new UserEntity('local-id', email, name);
    }
    const { data, error } = await this.client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) this.handleError(error);
    if (!data.user) throw new Error('User creation failed');
    return this.mapUser(data.user);
  }

  async inviteUser(email: string): Promise<UserEntity> {
    if (this.shouldSkip()) {
      return new UserEntity('local-id', email);
    }

    this.logger.log(`Inviting user via Supabase: ${email}`);

    // Use Supabase's built-in inviteUserByEmail with custom SMTP
    const { data, error } = await this.client.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: process.env.FRONTEND_URL || 'http://localhost:3000',
      },
    );

    if (error) this.handleError(error);
    if (!data.user) throw new Error('User invitation failed');

    this.logger.log(
      'User invitation sent successfully via Supabase:',
      data.user.email,
    );
    return this.mapUser(data.user);
  }

  async listUsers(page = 1): Promise<UserEntity[]> {
    if (this.shouldSkip()) {
      return [];
    }
    const { data, error } = await this.client.auth.admin.listUsers({
      page,
    });
    if (error) {
      this.logger.error(`Error: ${error.message}`);
      throw error;
    }
    return (data.users || []).map((u) => this.mapUser(u));
  }

  async updateUser(
    id: string,
    updates: { password?: string },
  ): Promise<UserEntity> {
    if (this.shouldSkip()) {
      return new UserEntity(id, '', undefined);
    }
    const { data, error } = await this.client.auth.admin.updateUserById(
      id,
      updates,
    );
    if (error) this.handleError(error);
    if (!data.user) throw new Error('User update failed');
    return this.mapUser(data.user);
  }

  async deleteUser(id: string): Promise<UserEntity> {
    if (this.shouldSkip()) {
      return new UserEntity(id, '', undefined);
    }
    const { data, error } = await this.client.auth.admin.deleteUser(id);
    if (error) this.handleError(error);
    if (!data.user) throw new Error('User deletion failed');
    return this.mapUser(data.user);
  }
}
