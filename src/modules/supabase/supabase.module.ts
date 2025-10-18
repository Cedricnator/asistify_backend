import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SupabaseClient => {
        const url =
          config.get<string>('supabase.url') || process.env.SUPABASE_URL;
        const key =
          config.get<string>('supabase.serviceRoleKey') ||
          process.env.SUPABASE_SERVICE_ROLE_KEY;
        const jwt =
          config.get<string>('supabase.authJwtSecret') ||
          process.env.SUPABASE_AUTH_JWT_SECRET;
        const anon =
          config.get<string>('supabase.anonKey') ||
          process.env.SUPABASE_ANON_KEY;

        if (!url || !key || !jwt || !anon) {
          throw new Error(
            'SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_AUTH_JWT_SECRET must be set',
          );
        }

        return createClient(url, key, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
      },
    },
  ],
  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
