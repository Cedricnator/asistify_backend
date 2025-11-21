import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEnterpriseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  subscriptionId?: string;
}
