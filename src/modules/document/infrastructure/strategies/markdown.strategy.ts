import { Injectable, Logger } from '@nestjs/common';
import { TextExtractionStrategy } from '../../domain/strategies/text-extraction.strategy';

@Injectable()
export class MarkdownStrategy implements TextExtractionStrategy {
  private readonly logger = new Logger(MarkdownStrategy.name);

  canHandle(mimeType: string): boolean {
    return mimeType === 'text/markdown' || mimeType === 'text/x-markdown';
  }

  async extract(buffer: Buffer): Promise<string> {
    const text = buffer.toString('utf-8');
    this.logger.debug(`Extracted ${text.length} characters from Markdown`);
    return text;
  }
}
