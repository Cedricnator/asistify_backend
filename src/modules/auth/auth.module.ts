import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  providers: [SupabaseModule],
  controllers: [],
})
export class AuthModule {}
