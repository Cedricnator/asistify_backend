export interface CreateChunkCommand {
  content: string;
  documentId: string;
  embedding: number[];
  keywords: string[];
  metadata: any;
  documentChunkTypeId: string;
}
