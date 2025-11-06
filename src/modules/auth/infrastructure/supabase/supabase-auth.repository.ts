import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthError, SupabaseClient } from '@supabase/supabase-js';
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
        return (
            this.env === process.env.NODE_ENV || process.env.NODE_ENV === 'test'
        );
    }

    private handleError(error: AuthError) {
        this.logger.error('Error creating user in Supabase', {
            message: error.message,
        });
        throw error;
    }

    private mapUser(u: any): UserEntity {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        return new UserEntity(u.id, u.email, u.user_metadata?.name);
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
        this.logger.log(
            'User invitation sent successfully via Supabase:',
            data.user?.email,
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
        return (data.users || []).map((u: any) => this.mapUser(u));
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
        return this.mapUser(data.user);
    }

    async deleteUser(id: string): Promise<UserEntity> {
        if (this.shouldSkip()) {
            return new UserEntity(id, '', undefined);
        }
        const { data, error } = await this.client.auth.admin.deleteUser(id);
        if (error) this.handleError(error);
        return this.mapUser(data.user);
    }
}
