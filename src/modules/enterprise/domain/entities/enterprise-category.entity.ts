export class EnterpriseCategoryEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly description?: string | null,
  ) {}
}
