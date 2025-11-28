export interface CreateEnterpriseProfileCommand {
  profileId: string;
  enterpriseId: string;
  isOwner: boolean;
  membershipId?: string; // :^)
}
