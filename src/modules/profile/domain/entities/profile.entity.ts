export class ProfileEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly roleId: string,
    public readonly phoneNumber?: string | null,
    public readonly avatar?: string | null,
  ) {}
}
