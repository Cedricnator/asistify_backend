import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PlanInterval } from '../../domain/entities/plan-interval.entity';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsNotEmpty()
  planName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Optional()
  @ApiProperty({enum:()=>PlanInterval})
  billingInterval: PlanInterval;

  @IsString()
  @Optional()
  currency: string;

  
}
