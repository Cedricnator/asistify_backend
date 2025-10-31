import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';

@Module({
    imports: [PrismaModule, SupabaseModule],
    providers: [AssistantService],
    controllers: [AssistantController],
    exports: [AssistantService],
})
export class AssistantModule {}
