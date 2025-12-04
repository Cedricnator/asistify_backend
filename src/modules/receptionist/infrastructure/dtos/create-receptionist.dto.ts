import {
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
  @IsNotEmpty()
  readonly cellphone: string;

  @IsUUID()
  readonly avatarId: string;

  @IsNumber()
  @IsNotEmpty()
  readonly levelFormality: number;

  @IsNumber()
  @IsNotEmpty()
  readonly levelDynamism: number;

  @IsUUID()
  @IsOptional()
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
