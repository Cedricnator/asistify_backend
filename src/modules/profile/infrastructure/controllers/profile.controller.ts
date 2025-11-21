import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Version,
} from '@nestjs/common';
import { FindProfileByIdUseCase } from '../../application/use-cases/profile/find-profile-by-id.use-case';
import { FindProfileByEmailUseCase } from '../../application/use-cases/profile/find-profile-by-email.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/profile/update-profile.use-case';
import { ProfileEntity } from '../../domain/entities/profile.entity';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly findProfileByIdUseCase: FindProfileByIdUseCase,
    private readonly findProfileByEmailUseCase: FindProfileByEmailUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Version('1')
  @Get(':id')
  @HttpCode(200)
  async findOneById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProfileEntity> {
    return await this.findProfileByIdUseCase.execute(id);
  }

  @Version('1')
  @Get(':email')
  @HttpCode(200)
  async findOneByEmail(@Param('email') email: string): Promise<ProfileEntity> {
    return await this.findProfileByEmailUseCase.execute(email);
  }

  @Version('1')
  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileEntity> {
    return await this.updateProfileUseCase.execute({ id: id, data: dto });
  }
}
