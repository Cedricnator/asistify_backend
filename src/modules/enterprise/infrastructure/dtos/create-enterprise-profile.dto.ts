import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEnterpriseProfileDto {
  @IsUUID()
  @IsNotEmpty()
  profileId: string;

  @IsUUID()
  @IsNotEmpty()
  enterpriseId: string;

  @IsBoolean()
  @IsNotEmpty()
  isOwner: boolean;
}
