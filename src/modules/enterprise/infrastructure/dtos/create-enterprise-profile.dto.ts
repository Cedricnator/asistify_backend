import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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

  @IsUUID()
  @IsOptional()
  membershipId?: string;
}
