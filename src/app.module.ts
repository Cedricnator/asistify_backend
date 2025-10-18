import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          targets: [
            ...(process.env.NODE_ENV === 'development'
              ? [
                  {
                    target: 'pino-pretty',
                    level: process.env.LOG_LEVEL || 'debug',
                    options: {
                      messageKey: 'message',
                      colorize: true,
                      singleLine: true,
                    },
                  },
                ]
              : []),
          ],
        },
        messageKey: 'message',
        serializers: {
          req: () => {
            return undefined;
          },
          res: () => {
            return undefined;
          },
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
