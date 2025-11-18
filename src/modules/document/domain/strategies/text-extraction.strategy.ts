export interface TextExtractionStrategy {
  canHandle(mimeType: string): boolean;
  extract(buffer: Buffer): Promise<string>;
}
