export interface CreateReceptionistCommand {
  name: string;
  cellphone: string;
  levelFormality: number;
  levelDynamism: number;
  anticipationMaxDays: number;
  anticipationMinDays: number;
  enterpriseId: string;
  avatarId: string;
  enterpriseInformation?: string | null;
  clientInformation?: string | null;
  businessRestrictions?: string | null;
}
