import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { WsAdapter } from '@nestjs/platform-ws';
import { VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['log', 'error', 'debug', 'warn', 'verbose'],
  });

  // Use WsAdapter for WebSocket support (needed for Twilio Media Streams)
  app.useWebSocketAdapter(new WsAdapter(app));

  // Enable CORS for development
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-twilio-signature',
      // Allow custom API version header used by the frontend axios interceptor
      'X-API-Version',
    ],
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useLogger(app.get(Logger));
  app.flushLogs();

  const config = new DocumentBuilder()
    .setTitle('Asistify Backend')
    .setDescription('The Asistify API')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'X-API-Version',
    defaultVersion: [VERSION_NEUTRAL],
  });

  const logger = app.get(Logger);

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    logger.log('SIGTERM signal received: closing HTTP server');
    void app.close().then(() => {
      logger.log('HTTP server closed');
    });
  });

  process.on('SIGINT', () => {
    logger.log('SIGINT signal received: closing HTTP server');
    void app.close().then(() => {
      logger.log('HTTP server closed');
    });
  });
}

void bootstrap();
