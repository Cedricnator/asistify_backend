export const DOCUMENTS_COUNT = 'DOCUMENTS_COUNT';
export interface DocumentsCountPort {
  getDocumentsCount(idEnterprise: string): Promise<number>;
}
