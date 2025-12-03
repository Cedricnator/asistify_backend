import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from '../../../domain/repositories/document.repository';

@Injectable()
export class FindDocumentsUseCase {
  private readonly logger = new Logger(FindDocumentsUseCase.name);

  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(params: {
    enterpriseId: string;
    page?: number;
    limit?: number;
    name?: string;
  }) {
    if (!params.enterpriseId) {
      this.logger.error('Enterprise Id is missing in parameters');
      throw new BadRequestException('Enterprise Id is required');
    }
    return await this.documentRepository.findAll(params);
  }
}
