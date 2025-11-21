import { Injectable, Logger } from '@nestjs/common';
import { TextExtractionStrategy } from '../../domain/strategies/text-extraction.strategy';
import XLSX from 'xlsx';

@Injectable()
export class ExcelStrategy implements TextExtractionStrategy {
  private readonly logger = new Logger(ExcelStrategy.name);

  canHandle(mimeType: string): boolean {
    return (
      mimeType === 'application/vnd.ms-excel' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  }

  async extract(buffer: Buffer): Promise<string> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const texts: string[] = [];

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const csvText = XLSX.utils.sheet_to_csv(sheet);
        if (csvText.trim()) {
          texts.push(`[Sheet: ${sheetName}]\n${csvText}`);
        }
      });

      const result = texts.join('\n\n');
      this.logger.debug(
        `Extracted ${workbook.SheetNames.length} sheets, ${result.length} characters`,
      );

      return result;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to extract Excel: ${err.message}`);
      throw new Error(`Excel extraction failed: ${err.message}`);
    }
  }
}
