import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateAvatarDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  url: string;
}
