import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { CreateDocumentCommand } from '../../domain/commands/create-document.command';
import { DocumentEntity } from '../../domain/entities/document.entity';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { Document, Prisma } from '@prisma/client';

@Injectable()
export class DocumentPrismaRepository implements DocumentRepository {
  private readonly logger = new Logger(DocumentPrismaRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  private mapToDomain(row: Document): DocumentEntity {
    return new DocumentEntity(
      row.id,
      row.original_name,
      row.extension_content,
      row.size,
      row.file_path,
      row.name,
      row.document_type_id,
      row.enterprise_id,
      row.created_at,
      row.updated_at,
    );
  }

  async create(params: CreateDocumentCommand): Promise<DocumentEntity> {
    try {
      this.logger.log(`Creating document: ${JSON.stringify(params, null, 2)}`);
      const document = await this.prismaService.document.create({
        data: {
          original_name: params.originalName,
          extension_content: params.extensionContent,
          size: params.size,
          file_path: params.filePath,
          name: params.name,
          document_type_id: params.documentTypeId,
          enterprise_id: params.enterpriseId,
        },
      });
      this.logger.log(`Document created with ID: ${document.id}`);
      return this.mapToDomain(document);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.error(
            `Conflict error while creating document: ${error.message}`,
          );
          throw new ConflictException('Document already exists');
        }
        if (error.code === 'P2003') {
          this.logger.error(
            `Foreign key constraint failed while creating document: ${error.message}`,
          );
          throw new ConflictException('Invalid document type or enterprise');
        }
      }
      this.logger.error(
        `Internal server error while creating document: ${error}`,
      );
      throw new InternalServerErrorException('Database error');
    }
  }

  async findAll(params: {
    enterpriseId: string;
    page?: number;
    limit?: number;
    name?: string;
  }): Promise<DocumentEntity[]> {
    this.logger.log(
      `Finding documents with params: ${JSON.stringify(params, null, 2)}`,
    );
    const documents = await this.prismaService.document.findMany({
      where: {
        enterprise_id: params.enterpriseId,
      },
    });
    return documents.map((doc) => this.mapToDomain(doc));
  }

  async findOne(id: string): Promise<DocumentEntity> {
    try {
      this.logger.log(`Finding document with ID: ${id}`);
      const document = await this.prismaService.document.findUnique({
        where: { id },
      });

      if (!document)
        throw new NotFoundException(`Document with id: ${id} not found`);

      this.logger.log(`Document found: ${JSON.stringify(document, null, 2)}`);
      return this.mapToDomain(document);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `Internal server error while fetching document: ${error}`,
      );
      throw new InternalServerErrorException('Database error');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting document with ID: ${id}`);
      await this.prismaService.document.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.error(`Document with ID: ${id} not found for deletion`);
          throw new NotFoundException(`Document with id '${id}' not found`);
        }
      }
      this.logger.error(
        `Internal server error while deleting document: ${error}`,
      );
      throw new InternalServerErrorException('Failed to delete document');
    }
  }

  async deleteMany(ids: string[]): Promise<void> {
    try {
      this.logger.log(`Deleting documents with IDs: ${ids.join(', ')}`);
      await this.prismaService.document.deleteMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.error(
            `One or more documents not found for deletion: ${ids.join(', ')}`,
          );
          throw new NotFoundException('One or more documents not found');
        }
      }
      this.logger.error(
        `Internal server error while deleting documents: ${error}`,
      );
      throw new InternalServerErrorException('Failed to delete documents');
    }
  }
}
