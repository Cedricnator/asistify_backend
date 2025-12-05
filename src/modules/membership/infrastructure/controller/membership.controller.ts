import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Version,
} from '@nestjs/common';
import { ListAllMembershipsUseCase } from '../../application/use-cases/list-all-memberships.use-case';
import { MembershipEntity } from '../../domain/entities/membership.entity';
import { Public } from 'src/modules/auth/infrastructure/decorators/public.decorator';
import { CreateMembershipUseCase } from '../../application/use-cases/create-membership.use-case';
import { DeleteMembershipUseCase } from '../../application/use-cases/delete-membership.use-case';

@Controller('membership')
export class MembershipController {
  constructor(
    private readonly listAllMemberships: ListAllMembershipsUseCase,
    private readonly createMembershipUseCase: CreateMembershipUseCase,
    private readonly deleteMembershipUseCase: DeleteMembershipUseCase,
  ) {}
  @Public()
  @Get()
  @Version('1')
  async findAll(): Promise<MembershipEntity[]> {
    return await this.listAllMemberships.execute();
  }
  @Public()
  @Post()
  @Version('1')
  async create(
    @Body() createMembershipDto: MembershipEntity,
  ): Promise<MembershipEntity> {
    return this.createMembershipUseCase.execute(createMembershipDto);
  }
  @Public()
  @Delete(':id')
  @Version('1')
  async delete(@Param('id') id: string): Promise<string> {
    await this.deleteMembershipUseCase.execute(id);
    return 'Membership deleted successfully';
  }
}
