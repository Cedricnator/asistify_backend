export interface CreateEnterpriseProfileCommand {
  profileId: string;
  enterpriseId: string;
  membershipId?:string; // :^)
  isOwner: boolean;
}
