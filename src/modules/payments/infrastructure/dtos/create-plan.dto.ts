import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PlanInterval } from '../../domain/entities/plan-interval.entity';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
   @ApiProperty({
    description: 'Plan ID to register in Flow',
    example: 'test',
  })
  planId: string;

  @IsString()
  @IsNotEmpty()
   @ApiProperty({
    description: 'Name to show',
    example: 'Premium Plan',
  })
  planName: string;

  @IsString()
  @IsNotEmpty()
   @ApiProperty({
    description: 'Description to show',
    example: 'A really good deal',
  })
  description: string;

  @IsNumber()
  @IsNotEmpty()
   @ApiProperty({
    description: 'Price to charge',
    example: '5000',
  })
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Optional()
  @ApiProperty({enum:()=>PlanInterval,description:"Interval of the plan. Daily, Weekly, Monthly or Yearly"})
  billingInterval: PlanInterval;

  @IsString()
  @Optional()
   @ApiProperty({
    description: 'Currency used for the price. CLP by deault',
    example: 'CLP',
  })
  currency: string;

  
}
