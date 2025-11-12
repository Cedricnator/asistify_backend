import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { MembershipController } from './modules/membership/infrastructure/controller/membership.controller';
import { ProfileModule } from './modules/profile/profile.module';

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
    MinioModule,
    ReceptionistModule,
    TwilioModule,
    DocumentModule,
    MembershipModule,
    AuthModule,
    ProfileModule,
  ],
  controllers: [AppController, MembershipController],
  providers: [AppService, PrismaModule, SupabaseModule],
})
export class AppModule {}
