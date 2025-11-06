import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { DocumentTypeRepository } from '../../domain/repositories/document-type.repository';
import { CreateDocumentTypeCommand } from '../../domain/commands/create-document-type.command';
import { DocumentTypeEntity } from '../../domain/entities/document-type.entity';
import { DocumentType, Prisma } from '@prisma/client';

@Injectable()
export class DocumentTypePrismaRepository implements DocumentTypeRepository {
  private readonly logger = new Logger(DocumentTypePrismaRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  private mapToDomain(row: DocumentType): DocumentTypeEntity {
    return new DocumentTypeEntity(
      row.id,
      row.name,
      row.created_at,
      row.updated_at,
    );
  }

  async create(params: CreateDocumentTypeCommand): Promise<DocumentTypeEntity> {
    try {
      this.logger.log(
        `Creating document type: ${JSON.stringify(params, null, 2)}`,
      );
      const dtype = await this.prismaService.documentType.create({
        data: {
          name: params.name,
        },
      });
      this.logger.log(`Document type created with ID: ${dtype.id}`);
      return this.mapToDomain(dtype);
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError)) throw error;
      // P2002: Unique constraint violation
      if (error.code === 'P2002') {
        this.logger.error(
          `Conflict error while creating document type: ${error.message}`,
        );
        throw new ConflictException(
          `Document type with name '${params.name}' already exists`,
        );
      }

      // P2003: Foreign key constraint violation
      if (error.code === 'P2003') {
        this.logger.error(
          `Foreign key constraint failed while creating document type: ${error.message}`,
        );
        throw new ConflictException('Foreign key constraint failed');
      }

      // P2025: Record not found
      if (error.code === 'P2025') {
        this.logger.error(
          `Record not found error while creating document type: ${error.message}`,
        );
        throw new NotFoundException('Record not found');
      }

      this.logger.error(
        `Internal server error while creating document type: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to delete document type');
    }
  }

  async findAll(): Promise<DocumentTypeEntity[]> {
    this.logger.log('Fetching all document types');
    const dTypes = await this.prismaService.documentType.findMany();
    return dTypes.map((dt) => this.mapToDomain(dt));
  }

  async findOne(id: string): Promise<DocumentTypeEntity> {
    try {
      this.logger.log(`Finding document type with ID: ${id}`);
      const dtype = await this.prismaService.documentType.findUnique({
        where: { id: id },
      });

      if (!dtype)
        throw new NotFoundException(`DocumentType with id: ${id} not found`);
      return this.mapToDomain(dtype);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Internal server error while fetching document type: ${error}`,
        );
        throw new InternalServerErrorException('Failed to fetch document type');
      }
      this.logger.error(`NotFoundError: ${error.message}`);
      throw error;
    }
  }

  async update(params: {
    id: string;
    updates: Partial<DocumentTypeEntity>;
  }): Promise<DocumentTypeEntity> {
    try {
      const dtype = await this.prismaService.documentType.update({
        where: { id: params.id },
        data: {
          name: params.updates.name,
        },
      });
      return this.mapToDomain(dtype);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.error(error.message);
          throw new NotFoundException(
            `Document type with id '${params.id}' not found`,
          );
        }
        if (error.code === 'P2002') {
          this.logger.error(error.message);
          throw new ConflictException(
            `Document type with name '${params.updates.name}' already exists`,
          );
        }
      }
      this.logger.error(
        `Internal server error while updating document type: ${error}`,
      );
      throw new InternalServerErrorException('Failed to update document type');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.documentType.delete({
        where: { id },
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        this.logger.error(
          `Internal server error while deleting document type: ${error}`,
        );
        throw new InternalServerErrorException(
          'Failed to delete document type',
        );
      }

      if (error.code === 'P2025') {
        this.logger.error(
          `Document type with ID: ${id} not found for deletion`,
        );
        throw new NotFoundException(`Document type with id '${id}' not found`);
      }
      // P2003: Foreign key constraint (can't delete because has relations)
      if (error.code === 'P2003') {
        this.logger.error(
          `Foreign key constraint failed while deleting document type: ${error.message}`,
        );
        throw new ConflictException(
          'Cannot delete document type with existing documents',
        );
      }
    }
  }
}
