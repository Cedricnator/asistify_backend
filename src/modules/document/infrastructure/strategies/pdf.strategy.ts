import { Injectable, Logger } from '@nestjs/common';
import { TextExtractionStrategy } from '../../domain/strategies/text-extraction.strategy';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfStrategy implements TextExtractionStrategy {
  private readonly logger = new Logger(PdfStrategy.name);

  canHandle(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  async extract(buffer: Buffer): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const parser = new PDFParse({ data: buffer });

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await parser.getText();

      this.logger.debug(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Extracted ${result.pages?.length || 0} pages from PDF, ${result.text.length} characters`,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      return result.text;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to extract PDF: ${err.message}`);
      throw new Error(`PDF extraction failed: ${err.message}`);
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await parser.destroy();
    }
  }
}
