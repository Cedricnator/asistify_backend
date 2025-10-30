import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { ReceptionistController } from './receptionist.controller';
import { ReceptionistService } from './receptionist.service';

@Module({
    imports: [PrismaModule, SupabaseModule],
    providers: [ReceptionistService],
    controllers: [ReceptionistController],
    exports: [ReceptionistService],
})
export class ReceptionistModule {}
