export class EnterpriseProfileEntity {
  constructor(
    public readonly id: string,
    public readonly profileId: string,
    public readonly enterpriseId: string,
    public readonly isOwner: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
