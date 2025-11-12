import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUUID,
} from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsUUID()
  roleId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  avatar?: string | undefined;
}
