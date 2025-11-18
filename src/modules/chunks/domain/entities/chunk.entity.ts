export class ChunkEntity {
  constructor(
    public readonly id: string,
    public readonly index: number,
    public readonly content: string,
    public readonly documentId: string,
    public readonly embedding: number[],
    public readonly keywords: string[],
    public readonly metadata: any,
    public readonly document_chunk_type_id: string,
    public readonly createdAt: Date,
  ) {}
}
