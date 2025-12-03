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
  Version,
} from '@nestjs/common';
import { CreateEnterpriseUseCase } from '../../application/use-cases/enterprise/create-enterprise.use-case';
import { FindEnterpriseByIdUseCase } from '../../application/use-cases/enterprise/find-enterprise-by-id.use-case';
import { UpdateEnterpriseUseCase } from '../../application/use-cases/enterprise/update-enterprise.use-case';
import { DeleteEnterpriseUseCase } from '../../application/use-cases/enterprise/delete-enterprise.use-case';
import { CreateEnterpriseDto } from '../dtos/create-enterprise.dto';
import { UpdateEnterpriseDto } from '../dtos/update-enterprise.dto';
import { EnterpriseEntity } from '../../domain/entities/enterprise.entity';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';

@Controller('enterprises')
export class EnterpriseController {
  constructor(
    private readonly createEnterpriseUseCase: CreateEnterpriseUseCase,
    private readonly findEnterpriseByIdUseCase: FindEnterpriseByIdUseCase,
    private readonly updateEnterpriseUseCase: UpdateEnterpriseUseCase,
    private readonly deleteEnterpriseUseCase: DeleteEnterpriseUseCase,
  ) {}

  @Version('1')
  @Public()
  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateEnterpriseDto): Promise<EnterpriseEntity> {
    return await this.createEnterpriseUseCase.execute(dto);
  }

  @Version('1')
  @Get(':id')
  @HttpCode(200)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EnterpriseEntity> {
    return await this.findEnterpriseByIdUseCase.execute(id);
  }

  @Version('1')
  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnterpriseDto,
  ): Promise<EnterpriseEntity> {
    return await this.updateEnterpriseUseCase.execute({ id, ...dto });
  }

  @Version('1')
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.deleteEnterpriseUseCase.execute(id);
  }
}
