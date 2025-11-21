import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { CreateEnterpriseProfileUseCase } from '../../application/use-cases/enterprise-profile/create-enterprise-profile.use-case';
import { FindEnterpriseProfilesByEnterpriseUseCase } from '../../application/use-cases/enterprise-profile/find-enterprise-profiles-by-enterprise.use-case';
import { FindEnterpriseProfilesByProfileUseCase } from '../../application/use-cases/enterprise-profile/find-enterprise-profiles-by-profile.use-case';
import { DeleteEnterpriseProfileUseCase } from '../../application/use-cases/enterprise-profile/delete-enterprise-profile.use-case';
import { CreateEnterpriseProfileDto } from '../dtos/create-enterprise-profile.dto';
import { EnterpriseProfileEntity } from '../../domain/entities/enterprise-profile.entity';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';

@Controller('enterprise-profiles')
export class EnterpriseProfileController {
  constructor(
    private readonly createEnterpriseProfileUseCase: CreateEnterpriseProfileUseCase,
    private readonly findEnterpriseProfilesByEnterpriseUseCase: FindEnterpriseProfilesByEnterpriseUseCase,
    private readonly findEnterpriseProfilesByProfileUseCase: FindEnterpriseProfilesByProfileUseCase,
    private readonly deleteEnterpriseProfileUseCase: DeleteEnterpriseProfileUseCase,
  ) {}

  @Version('1')
  @Post()
  @HttpCode(201)
  async create(
    @Body() dto: CreateEnterpriseProfileDto,
  ): Promise<EnterpriseProfileEntity> {
    return await this.createEnterpriseProfileUseCase.execute(dto);
  }

  @Version('1')
  @Get('enterprise/:enterpriseId')
  @HttpCode(200)
  async findByEnterprise(
    @Param('enterpriseId', ParseUUIDPipe) enterpriseId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedResponseDto<EnterpriseProfileEntity>> {
    const { data, total } =
      await this.findEnterpriseProfilesByEnterpriseUseCase.execute(
        enterpriseId,
        page,
        limit,
      );

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: { total, page, limit, totalPages },
    };
  }

  @Version('1')
  @Get('profile/:profileId')
  @HttpCode(200)
  async findByProfile(
    @Param('profileId', ParseUUIDPipe) profileId: string,
  ): Promise<EnterpriseProfileEntity[]> {
    return await this.findEnterpriseProfilesByProfileUseCase.execute(profileId);
  }

  @Version('1')
  @Delete(':profileId/:enterpriseId')
  @HttpCode(204)
  async delete(
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Param('enterpriseId', ParseUUIDPipe) enterpriseId: string,
  ): Promise<void> {
    return await this.deleteEnterpriseProfileUseCase.execute({
      profileId,
      enterpriseId,
    });
  }
}
