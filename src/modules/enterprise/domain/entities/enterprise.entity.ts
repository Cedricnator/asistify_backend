export class EnterpriseEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly categoryId: string,
    public readonly calendarId?: string | null,
    public readonly subscriptionId?: string | null,
  ) {}
}
