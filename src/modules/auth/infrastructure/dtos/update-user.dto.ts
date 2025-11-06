import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'New password for the user', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: "User's display name",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
