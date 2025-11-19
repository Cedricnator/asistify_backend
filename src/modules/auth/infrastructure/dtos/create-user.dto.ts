import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the new user',
  })
  @IsStrongPassword()
  @IsString()
  password: string;

  @ApiProperty({
    description: "User's display name",
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: "User's phone number (optional)",
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: "URL to the user's avatar image (optional)",
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
