import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateAvatarDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  url: string;
}
