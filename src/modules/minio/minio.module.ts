import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MINIO_TOKEN } from './minio.decorator';
import { MinioService } from './minio.service';
import * as Minio from 'minio';

@Global()
@Module({
  exports: [MINIO_TOKEN, MinioService],
  providers: [
    MinioService,
    {
      inject: [ConfigService],
      provide: MINIO_TOKEN,
      useFactory: async (
        configService: ConfigService,
      ): Promise<Minio.Client> => {
        const useSSL = configService.get<string>('MINIO_USE_SSL', 'false');
        const client = new Minio.Client({
          endPoint: configService.getOrThrow<string>('MINIO_ENDPOINT'),
          port: +configService.getOrThrow('MINIO_PORT'),
          accessKey: configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
          secretKey: configService.getOrThrow<string>('MINIO_SECRET_KEY'),
          useSSL: useSSL === 'true',
        });

        // Crear bucket si no existe
        const bucketName =
          configService.getOrThrow<string>('MINIO_BUCKET_NAME');
        const bucketExists = await client.bucketExists(bucketName);

        if (!bucketExists) {
          await client.makeBucket(bucketName, 'us-east-1');
          console.log(`✅ MinIO bucket '${bucketName}' created successfully`);
        }

        return client;
      },
    },
  ],
})
export class MinioModule {}
