import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { ReceptionistEntity } from '../../domain/entities/receptionist.entity';
import { CreateReceptionistDto } from '../dtos/create-receptionist.dto';
import { EditReceptionistDto } from '../dtos/edit-receptionist.dto';
import { ReceptionistMapper } from '../mappers/receptionist.mapper';
import { CreateReceptionistUseCase } from '../../application/use-cases/recepcionist/create-receptionist.use-case';
import { DeleteReceptionistUseCase } from '../../application/use-cases/recepcionist/delete-receptionist.use-case';
import { FindAllReceptionistsUseCase } from '../../application/use-cases/recepcionist/find-all-receptionists.use-case';
import { FindReceptionistByIdUseCase } from '../../application/use-cases/recepcionist/find-receptionist-by-id.use-case';
import { UpdateReceptionistUseCase } from '../../application/use-cases/recepcionist/update-receptionist.use-case';
import { EnterpriseId } from 'src/modules/auth/infrastructure/decorators/enterprise-id.decorator';
import { RequiresSuscriptionGuard } from 'src/modules/payments/infrastructure/middleware/requires-suscription.guard';

@Controller('receptionists')
export class ReceptionistController {
  constructor(
    private readonly createReceptionistUseCase: CreateReceptionistUseCase,
    private readonly findAllReceptionistsUseCase: FindAllReceptionistsUseCase,
    private readonly findReceptionistByIdUseCase: FindReceptionistByIdUseCase,
    private readonly updateReceptionistUseCase: UpdateReceptionistUseCase,
    private readonly deleteReceptionistUseCase: DeleteReceptionistUseCase,
  ) {}

  @Version('1')
  @Post()
  @UseGuards(RequiresSuscriptionGuard)
  @HttpCode(201)
  async create(
    @Body() dto: CreateReceptionistDto,
    @EnterpriseId() enterpriseId: string,
  ): Promise<ReceptionistEntity> {
    return await this.createReceptionistUseCase.execute({
      ...dto,
      enterpriseId,
    });
  }

  @Version('1')
  @Get()
  @HttpCode(200)
  async findAll(
    @EnterpriseId() enterpriseId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedResponseDto<ReceptionistEntity>> {
    Logger.log(enterpriseId);
    return await this.findAllReceptionistsUseCase.execute({
      enterpriseId,
      page,
      limit,
    });
  }

  @Version('1')
  @Get(':id')
  @HttpCode(200)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReceptionistEntity | null> {
    return await this.findReceptionistByIdUseCase.execute(id);
  }

  @Version('1')
  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EditReceptionistDto,
  ): Promise<ReceptionistEntity> {
    const existing = await this.findReceptionistByIdUseCase.execute(id);
    if (!existing) {
      throw new Error('Receptionist not found');
    }
    const entity = ReceptionistMapper.toUpdateEntity(id, dto, existing);
    return await this.updateReceptionistUseCase.execute(entity);
  }

  @Version('1')
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.deleteReceptionistUseCase.execute(id);
  }
}
