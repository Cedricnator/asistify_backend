import { Body, Controller, HttpCode, Post, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Public } from '../decorators/public.decorator';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';

@ApiTags('Auth Controller')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Public()
  @Version('1')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Successful login' })
  @Post('/login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return await this.loginUseCase.execute(dto);
  }

  @Public()
  @Version('1')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Successful registration' })
  @Post('/register')
  @HttpCode(201)
  async register(@Body() dto: CreateUserDto) {
    return await this.registerUseCase.execute(dto);
  }

  @Public()
  @Version('1')
  @ApiOperation({ summary: 'Refresh session token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @Post('/refresh-token')
  @HttpCode(200)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.refreshTokenUseCase.execute(dto.refreshToken);
  }
}
