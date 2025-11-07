import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../guards/supabase-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { FindUsersUseCase } from '../../application/use-cases/find-users.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserDto } from '../dtos/user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@ApiTags('users')
@Controller('admin/users')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
export class AuthController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUsersUseCase: FindUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return await this.createUserUseCase.execute(dto);
  }

  @Version('1')
  @Get()
  @ApiOperation({ summary: 'List registered users' })
  async list(@Query('page') page = '1'): Promise<UserDto[]> {
    return await this.findUsersUseCase.execute(Number(page));
  }

  @Version('1')
  @Patch(':id')
  @ApiOperation({ summary: "Update a user's password" })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    const command = {
      id,
      updates: dto,
    };
    return await this.updateUserUseCase.execute(command);
  }

  @Version('1')
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a user' })
  async remove(@Param('id') id: string): Promise<UserDto> {
    return await this.deleteUserUseCase.execute(id);
  }
}
