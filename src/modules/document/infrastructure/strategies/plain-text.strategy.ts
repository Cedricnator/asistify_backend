import { Injectable } from '@nestjs/common';
import { TextExtractionStrategy } from '../../domain/strategies/text-extraction.strategy';

@Injectable()
export class PlainTextStrategy implements TextExtractionStrategy {
  canHandle(mimeType: string): boolean {
    return mimeType === 'text/plain';
  }

  async extract(buffer: Buffer): Promise<string> {
    return buffer.toString('utf-8');
  }
}
