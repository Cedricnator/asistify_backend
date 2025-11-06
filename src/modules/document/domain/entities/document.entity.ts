export class DocumentEntity {
  constructor(
    public readonly id: string,
    public readonly originalName: string,
    public readonly extensionContent: string,
    public readonly size: number,
    public readonly filePath: string,
    public readonly name: string,
    public readonly documentTypeId: string,
    public readonly enterpriseId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
