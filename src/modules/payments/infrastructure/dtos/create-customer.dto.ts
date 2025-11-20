import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  enterpriseId: string;

  @IsNotEmpty()
  @IsString()
  profileId: string;
}
