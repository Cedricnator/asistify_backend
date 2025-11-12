import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateMetricDto {
  @IsNotEmpty()
  @IsString()
  modelUsed: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  tokenUsage: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  responseTimeMs: number;

  @IsNotEmpty()
  @IsString()
  receptionistId: string;
}
