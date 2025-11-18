import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RewriteQueryUseCase {
  private readonly logger = new Logger(RewriteQueryUseCase.name);
  private readonly geminiClient: GoogleGenAI;
  private readonly model = 'gemini-2.0-flash-exp';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.geminiClient = new GoogleGenAI({ apiKey });
  }

  async execute(query: string): Promise<string> {
    this.logger.log(`Rewriting query: "${query}"`);

    try {
      const prompt = this.buildPrompt(query);
      const result = await this.geminiClient.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 200,
        },
      });

      const rewrittenQuery =
        result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || query;

      this.logger.debug(
        `Original: "${query}" → Rewritten: "${rewrittenQuery}"`,
      );

      return rewrittenQuery;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error rewriting query: ${err.message}`);
      return query;
    }
  }

  private buildPrompt(query: string): string {
    return `Reescribe esta consulta de voz para una búsqueda semántica en documentos, haciéndola más clara y específica. Corrige errores de transcripción si los hay. Mantén el idioma original.

Consulta original: "${query}"

Consulta reescrita (solo devuelve la consulta mejorada, sin explicaciones):`;
  }
}
