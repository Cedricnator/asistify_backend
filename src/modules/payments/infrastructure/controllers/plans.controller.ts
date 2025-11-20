import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,

  Post,
  Query,
  Version,
} from '@nestjs/common';

;
import { CreatePlanUseCase } from '../../application/use-cases/create-plan.use-case';
import { UpdatePlanUseCase } from '../../application/use-cases/update-plan.use-case';
import { ListPlansUseCase } from '../../application/use-cases/list-plans.use-case';
import { GetPlanUseCase } from '../../application/use-cases/get-plan.use-case';
import { PlanEntity } from '../../domain/entities/plan.entity';
import { CreatePlanDto } from '../dtos/create-plan.dto';
import { UpdatePlanDto } from '../dtos/update-plan.dto';


@Controller('plans')
export class PlansController {
  constructor(
    private readonly createPlanUseCase: CreatePlanUseCase,
    private readonly updatePlanUseCase:UpdatePlanUseCase,
    private readonly listPlansUseCase: ListPlansUseCase,
    private readonly getPlanUseCase: GetPlanUseCase,
    
  ) {}

  

  @Version('1')
  @Post()
  @HttpCode(200)
  async createPlan(@Body() dto: CreatePlanDto): Promise<PlanEntity> {
    return await this.createPlanUseCase.execute(dto);
  }


  @Version('1')
  @Post("update")
  @HttpCode(200)
  async update(@Body() dto: UpdatePlanDto): Promise<PlanEntity> {
    return await this.updatePlanUseCase.execute(dto);
  }

  @Version('1')
  @Get()
  @HttpCode(200)
  async findOne(
    @Query('planId') planId: string,
  ): Promise<PlanEntity> {
    
    return await this.getPlanUseCase.execute({planId});
  }

  @Version('1')
  @Get("list")
  @HttpCode(200)
  async list(
    ): Promise<PlanEntity[]> {
    
    return await this.listPlansUseCase.execute();
  }

  

  // @Version('1')
  // @Delete()
  // @HttpCode(200)
  // async cancel(@Query('suscriptionId') suscriptionId: string): Promise<string> {
  //   let command:CancelSuscriptionCommand={
  //       suscriptionId
  //   }
  //   return await this.cancelSuscriptionUseCase.execute(command);
  // }
}
