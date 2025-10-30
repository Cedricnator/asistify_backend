import { Receptionist } from '@prisma/client';

export class ReceptionistEntity {
    id: string;
    name: string;
    avatar: string;
    levelFormality: number;
    levelDynamism: number;
    cellphone: string;
    enterpriseId: string;
    enterpriseInformation?: string;
    clientInformation?: string;
    businessRestrictions?: string;
    anticipationMaxDays?: number;
    anticipationMinDays?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
