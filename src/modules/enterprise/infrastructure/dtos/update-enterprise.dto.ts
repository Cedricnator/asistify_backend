import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateEnterpriseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  subscriptionId?: string;
}
