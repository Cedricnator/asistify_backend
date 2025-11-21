import { Injectable, Logger } from '@nestjs/common';
import { TextExtractionStrategy } from '../../domain/strategies/text-extraction.strategy';
import * as mammoth from 'mammoth';

@Injectable()
export class DocxStrategy implements TextExtractionStrategy {
  private readonly logger = new Logger(DocxStrategy.name);

  canHandle(mimeType: string): boolean {
    return (
      mimeType === 'application/msword' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  }

  async extract(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      this.logger.debug(
        `Extracted ${result.value.length} characters from DOCX`,
      );

      if (result.messages.length > 0) {
        this.logger.warn(
          `Mammoth warnings: ${result.messages.map((m) => m.message).join(', ')}`,
        );
      }

      return result.value;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to extract DOCX: ${err.message}`);
      throw new Error(`DOCX extraction failed: ${err.message}`);
    }
  }
}
