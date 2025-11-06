import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { ReceptionistController } from './receptionist.controller';
import { ReceptionistService } from './receptionist.service';
import { AssistantManager } from './assistant/assistant-manager';
import { VoiceAgent } from './assistant/agents/voice-agent';

@Module({
  imports: [PrismaModule, SupabaseModule],
  providers: [ReceptionistService, AssistantManager, VoiceAgent],
  controllers: [ReceptionistController],
  exports: [ReceptionistService, AssistantManager],
})
export class ReceptionistModule {}
