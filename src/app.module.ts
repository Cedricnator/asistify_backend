import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { ReceptionistModule } from './modules/receptionist/receptionist.module';
import { TwilioModule } from './modules/twilio/twilio.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentModule } from './modules/document/document.module';
import { MinioModule } from './modules/minio/minio.module';
import { MembershipModule } from './modules/membership/membership.module';
import { ProfileModule } from './modules/profile/profile.module';
import { EnterpriseModule } from './modules/enterprise/enterprise.module';
import { ChunkModule } from './modules/chunks/chunk.module';
import { HealthModule } from './modules/health/health.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CalendarModule } from './modules/calendar/calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot({
      pinoHttp:
        process.env.NODE_ENV === 'production'
          ? {
              level: process.env.LOG_LEVEL || 'info',
              messageKey: 'message',
              serializers: {
                req: () => undefined,
                res: () => undefined,
              },
            }
          : {
              transport: {
                target: 'pino-pretty',
                options: {
                  messageKey: 'message',
                  colorize: true,
                  singleLine: true,
                  levelFirst: true,
                  translateTime: 'HH:MM:ss',
                },
              },
              level: process.env.LOG_LEVEL || 'debug',
              messageKey: 'message',
              serializers: {
                req: () => undefined,
                res: () => undefined,
              },
            },
    }),
    // Global Modules
    PrismaModule,
    // Specific Modules
    SupabaseModule,
    MinioModule,
    ReceptionistModule,
    TwilioModule,
    DocumentModule,
    MembershipModule,
    AuthModule,
    ProfileModule,
    EnterpriseModule,
    ChunkModule,
    HealthModule,
    PaymentsModule,
    CalendarModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
