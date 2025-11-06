import { Receptionist } from '@prisma/client';

export class ReceptionistEntity {
  id: string;
  name: string;
  avatarId: string;
  cellphone: string;
  enterpriseInformation: string | null;
  clientInformation: string | null;
  businessRestrictions: string | null;
  levelFormality: number;
  levelDynamism: number;
  anticipationMaxDays: number;
  anticipationMinDays: number;
  enterpriseId: string;
  createdAt: Date;
  updatedAt: Date;
}
