import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSuscriptionDto {
  @IsString()
  @IsNotEmpty()
   @ApiProperty({
      description: 'Client ID returned by flow',
      example: 'cus_something',
    })
  flowclientId: string;

  @IsString()
  @IsNotEmpty()
   @ApiProperty({
    description: 'ID of the membership/plan that will be contracted',
    example: 'some-membership-uuid',
  })
  membershipId: string;

  @IsString()
  @IsNotEmpty()
   @ApiProperty({
    description: 'ID of the enterprise contracting the plan',
    example: 'some-enterprise-uuid',
  })
  enterpriseId: string;

  
}
