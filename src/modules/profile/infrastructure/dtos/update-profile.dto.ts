import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsStrongPassword,
  IsPhoneNumber,
  IsUUID,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsStrongPassword()
  password?: string;

  @IsOptional()
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  avatar?: string | undefined;
}
