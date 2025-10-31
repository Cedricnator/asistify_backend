import { IsMobilePhone, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateReceptionistDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsUUID()
    @IsNotEmpty()
    readonly avatarId: string;

    @IsNumber()
    @IsNotEmpty()
    readonly levelFormality: number;

    @IsNumber()
    @IsNotEmpty()
    readonly levelDynamism: number;

    @IsMobilePhone('es-CL')
    readonly cellphone: string;

    @IsUUID()
    @IsNotEmpty()
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