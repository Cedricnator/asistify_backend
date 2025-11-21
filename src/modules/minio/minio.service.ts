import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { InjectMinio } from './minio.decorator';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly bucketName: string;

  constructor(
    @InjectMinio() private readonly minioClient: Minio.Client,
    private readonly configService: ConfigService,
  ) {
    this.bucketName =
      this.configService.getOrThrow<string>('MINIO_BUCKET_NAME');
  }

  /**
   * Sube un archivo a MinIO
   * @param file - Archivo de Multer
   * @param folder - Carpeta opcional dentro del bucket
   * @returns Información del archivo subido
   */
  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{
    fileName: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
  }> {
    try {
      const fileExt = extname(file.originalname);
      const fileName = `${randomUUID()}${fileExt}`;
      const objectName = folder ? `${folder}/${fileName}` : fileName;

      this.logger.log(`Uploading file: ${objectName}`);

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'Original-Name': Buffer.from(file.originalname).toString('base64'),
        },
      );

      const url = await this.getFileUrl(objectName);

      this.logger.log(`File uploaded successfully: ${objectName}`);

      return {
        fileName: objectName,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        url,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Failed to upload file to storage',
      );
    }
  }

  /**
   * Obtiene la URL de un archivo
   * @param fileName - Nombre del archivo en MinIO
   * @returns URL presignada del archivo (válida por 7 días)
   */
  async getFileUrl(fileName: string): Promise<string> {
    try {
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        fileName,
        7 * 24 * 60 * 60, // 7 días
      );
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to get file URL: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to get file URL');
    }
  }

  /**
   * Descarga un archivo de MinIO
   * @param fileName - Nombre del archivo en MinIO
   * @returns Buffer del archivo
   */
  async downloadFile(fileName: string): Promise<Buffer> {
    try {
      const stream = await this.minioClient.getObject(
        this.bucketName,
        fileName,
      );
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(
        `Failed to download file: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to download file');
    }
  }

  /**
   * Elimina un archivo de MinIO
   * @param fileName - Nombre del archivo en MinIO
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      this.logger.log(`Deleting file: ${fileName}`);
      await this.minioClient.removeObject(this.bucketName, fileName);
      this.logger.log(`File deleted successfully: ${fileName}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Verifica si un archivo existe
   * @param fileName - Nombre del archivo en MinIO
   * @returns true si existe, false si no
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Lista todos los archivos en una carpeta
   * @param prefix - Prefijo/carpeta a buscar
   * @returns Lista de archivos
   */
  async listFiles(prefix?: string): Promise<string[]> {
    try {
      const stream = this.minioClient.listObjects(
        this.bucketName,
        prefix,
        true,
      );
      const files: string[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => files.push(obj.name));
        stream.on('end', () => resolve(files));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to list files');
    }
  }
}
