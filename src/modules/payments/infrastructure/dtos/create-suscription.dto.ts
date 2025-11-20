import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSuscriptionDto {
  @IsString()
  @IsNotEmpty()
  flowclientId: string;

  @IsString()
  @IsNotEmpty()
  membershipId: string;

  @IsString()
  @IsNotEmpty()
  enterpriseId: string;

  
}
