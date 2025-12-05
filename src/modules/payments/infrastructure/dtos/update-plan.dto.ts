import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PlanInterval } from '../../domain/entities/plan-interval.entity';

export class UpdatePlanDto {
  @IsString()
  @IsNotEmpty()
   @ApiProperty({
    description: 'custom flow ID of the plan',
    example: 'test1',
  })
  planId: string;

  @IsString()
  @IsNotEmpty()
   @ApiProperty({
    description: 'New name for the plan',
    example: 'New name',
  })
  planName: string;

  @IsString()
  @IsNotEmpty()
   @ApiProperty({
    description: 'New description to show for the plan',
    example: 'New description',
  })
  description: string;

  @IsNumber()
  @IsNotEmpty()
   @ApiProperty({
    description: 'New price for the plan',
    example: '80000',
  })
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Optional()
  @ApiProperty({enum:()=>PlanInterval, description:"Billing interval"})
  billingInterval: PlanInterval;

  @IsString()
  @Optional()
   @ApiProperty({
    description: 'Currency used for the price. CLP by default',
    example: 'CLP',
  })
  currency: string;

  
}
