import { Body, Controller, Get, Post, Version } from '@nestjs/common';
import { ListAllMembershipsUseCase } from '../../application/use-cases/list-all-memberships.use-case';
import { MembershipEntity } from '../../domain/entities/membership.entity';
import { Public } from 'src/modules/auth/infrastructure/decorators/public.decorator';
import { CreateMembershipUseCase } from '../../application/use-cases/create-membership.use-case';

@Controller('membership')
export class MembershipController {
  constructor(
    private readonly listAllMemberships: ListAllMembershipsUseCase,
    private readonly createMembershipUseCase: CreateMembershipUseCase,
  ) {}
  @Public()
  @Get()
  @Version('1')
  async findAll(): Promise<MembershipEntity[]> {
    return await this.listAllMemberships.execute();
  }
  @Public()
  @Post()
  async create(
    @Body() createMembershipDto: MembershipEntity,
  ): Promise<MembershipEntity> {
    return this.createMembershipUseCase.execute(createMembershipDto);
  }
}
