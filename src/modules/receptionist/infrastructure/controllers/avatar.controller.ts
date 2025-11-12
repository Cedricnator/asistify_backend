import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { AvatarEntity } from '../../domain/entities/avatar.entity';
import { CreateAvatarDto } from '../dtos/create-avatar.dto';
import { UpdateAvatarDto } from '../dtos/update-avatar.dto';
import { AvatarMapper } from '../mappers/avater.mapper';
import { CreateAvatarUseCase } from '../../application/use-cases/avatar/create-avatar.use-case';
import { FindAllAvatarsUseCase } from '../../application/use-cases/avatar/find-all-avatars.use-case';
import { FindAvatarByIdUseCase } from '../../application/use-cases/avatar/find-avatar-by-id.use-case';
import { UpdateAvatarUseCase } from '../../application/use-cases/avatar/update-avatar.use-case';

@Controller('avatars')
export class AvatarController {
  constructor(
    private readonly createAvatarUseCase: CreateAvatarUseCase,
    private readonly findAllAvatarsUseCase: FindAllAvatarsUseCase,
    private readonly findAvatarByIdUseCase: FindAvatarByIdUseCase,
    private readonly updateAvatarUseCase: UpdateAvatarUseCase,
  ) {}

  @Version('1')
  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateAvatarDto): Promise<AvatarEntity> {
    return await this.createAvatarUseCase.execute(dto);
  }

  @Version('1')
  @Get()
  @HttpCode(200)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedResponseDto<AvatarEntity>> {
    return await this.findAllAvatarsUseCase.execute({ page, limit });
  }

  @Version('1')
  @Get(':id')
  @HttpCode(200)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AvatarEntity | null> {
    return await this.findAvatarByIdUseCase.execute(id);
  }

  @Version('1')
  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAvatarDto,
  ): Promise<AvatarEntity> {
    const existing = await this.findAvatarByIdUseCase.execute(id);
    if (!existing) {
      throw new Error('Avatar not found');
    }
    const entity = AvatarMapper.toUpdateEntity(id, dto, existing);
    return await this.updateAvatarUseCase.execute(entity);
  }
}
