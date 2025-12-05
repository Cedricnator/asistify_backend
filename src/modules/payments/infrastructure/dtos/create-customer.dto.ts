import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
   @ApiProperty({
      description: 'Enterprise creating customer',
      example: 'some-enterprise-uuid',
    })
  enterpriseId: string;

  @IsNotEmpty()
  @IsString()
   @ApiProperty({
    description: 'User in representation of the enterprise',
    example: 'some-customer-uuid',
  })
  profileId: string;
}
