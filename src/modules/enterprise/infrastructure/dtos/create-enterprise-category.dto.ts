import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEnterpriseCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
