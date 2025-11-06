import {
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateReceptionistDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  readonly avatarId: string;

  @IsNumber()
  @IsNotEmpty()
  readonly levelFormality: number;

  @IsNumber()
  @IsNotEmpty()
  readonly levelDynamism: number;

  @IsString()
  readonly enterpriseId: string;

  @IsOptional()
  readonly enterpriseInformation?: string;

  @IsOptional()
  readonly clientInformation?: string;

  @IsOptional()
  readonly businessRestrictions?: string;

  @IsNumber()
  readonly anticipationMaxDays: number;

  @IsNumber()
  readonly anticipationMinDays: number;
}
