import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case';
import { CreateSuscriptionUseCase } from '../../application/use-cases/create-suscription.use-case';
import { ListSuscriptionsCommand } from '../../domain/commands/list-suscription.command';
import { ListSuscriptionsUseCase } from '../../application/use-cases/list-suscriptions.use-case';
import { GetSuscriptionUseCase } from '../../application/use-cases/get-suscription.use-case';
import { CancelSuscriptionUseCase } from '../../application/use-cases/cancel-suscription.use-case';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { SuscriptionEntity } from '../../domain/entities/suscription.entity';
import { GetSuscriptionCommand } from '../../domain/commands/get-suscription.command';
import { CancelSuscriptionCommand } from '../../domain/commands/cancel-suscription.command';
import { CreateSuscriptionDto } from '../dtos/create-suscription.dto';


@Controller('payments')
export class TestPaymentController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly createSuscriptionUseCase: CreateSuscriptionUseCase,
    private readonly listSuscriptionsUseCase: ListSuscriptionsUseCase,
    private readonly getSuscriptionUseCase: GetSuscriptionUseCase,
    private readonly cancelSuscriptionUseCase:CancelSuscriptionUseCase
  ) {}

  @Version('1')
  @Post("customer")
  @HttpCode(200)
  async create(@Body() dto: CreateCustomerDto): Promise<string> {
    return await this.createCustomerUseCase.execute(dto);
  }

@Version('1')
  @Post()
  @HttpCode(200)
  async suscription(@Body() dto: CreateSuscriptionDto): Promise<SuscriptionEntity> {
    return await this.createSuscriptionUseCase.execute(dto);
  }

  @Version('1')
  @Get()
  @HttpCode(200)
  async findOne(
    @Query('suscriptionId') suscriptionId: string,
    @Query('enterpriseId', ) enterpriseId: string,
    @Query('flowClientId' ) flowclientId: string,
  ): Promise<SuscriptionEntity> {
    let command:GetSuscriptionCommand={
        suscriptionId,
        enterpriseId,
        flowclientId
    }
    return await this.getSuscriptionUseCase.execute(command);
  }

  @Version('1')
  @Get("list")
  @HttpCode(200)
  async list(
    @Query('planId') planId: string
  ): Promise<SuscriptionEntity[]> {
    let command:ListSuscriptionsCommand={
        planId
    }
    return await this.listSuscriptionsUseCase.execute(command);
  }

  

  @Version('1')
  @Delete()
  @HttpCode(200)
  async cancel(@Query('suscriptionId') suscriptionId: string): Promise<string> {
    let command:CancelSuscriptionCommand={
        suscriptionId
    }
    return await this.cancelSuscriptionUseCase.execute(command);
  }
}
