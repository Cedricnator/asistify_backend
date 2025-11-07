import { Inject } from '@nestjs/common';

export const MINIO_TOKEN = 'MINIO_CLIENT';

export const InjectMinio = () => Inject(MINIO_TOKEN);
