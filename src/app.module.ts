import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { ReceptionistModule } from './modules/receptionist/receptionist.module';

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
        ReceptionistModule,
    ],
    controllers: [AppController],
    providers: [AppService, PrismaModule, SupabaseModule],
})
export class AppModule {}
