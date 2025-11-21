import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { TextExtractionStrategy } from '../../domain/strategies/text-extraction.strategy';
import { PlainTextStrategy } from '../../infrastructure/strategies/plain-text.strategy';
import { PdfStrategy } from '../../infrastructure/strategies/pdf.strategy';
import { DocxStrategy } from '../../infrastructure/strategies/docx.strategy';
import { ExcelStrategy } from '../../infrastructure/strategies/excel.strategy';
import { MarkdownStrategy } from '../../infrastructure/strategies/markdown.strategy';

@Injectable()
export class TextExtractionService {
  private readonly logger = new Logger(TextExtractionService.name);
  private readonly strategies: TextExtractionStrategy[];

  constructor(
    plainTextStrategy: PlainTextStrategy,
    pdfStrategy: PdfStrategy,
    docxStrategy: DocxStrategy,
    excelStrategy: ExcelStrategy,
    markdownStrategy: MarkdownStrategy,
  ) {
    this.strategies = [
      plainTextStrategy,
      pdfStrategy,
      docxStrategy,
      excelStrategy,
      markdownStrategy,
    ];
  }

  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    this.logger.log(`Extracting text from file with mimetype: ${mimeType}`);

    const strategy = this.strategies.find((s) => s.canHandle(mimeType));

    if (!strategy) {
      const supportedTypes = this.getSupportedMimeTypes();
      throw new BadRequestException(
        `Unsupported file type: ${mimeType}. Supported types: ${supportedTypes.join(', ')}`,
      );
    }

    const text = await strategy.extract(buffer);

    if (!text || text.trim().length === 0) {
      throw new BadRequestException(
        'No text could be extracted from the document',
      );
    }

    this.logger.log(
      `Successfully extracted ${text.length} characters from ${mimeType}`,
    );

    return text;
  }

  getSupportedMimeTypes(): string[] {
    return [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/markdown',
      'text/x-markdown',
    ];
  }
}
