import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { CreateDocumentCommand } from '../../domain/commands/create-document.command';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto implements CreateDocumentCommand {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Original name of the document',
    example: 'report.pdf',
  })
  originalName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'File extension or content type of the document',
    example: 'pdf',
  })
  extensionContent: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({
    description: 'Size of the document in bytes',
    example: 204800,
  })
  size: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'File path where the document is stored',
    example: '/files/documents/report.pdf',
  })
  filePath: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name assigned to the document',
    example: 'Annual Report 2023',
  })
  name: string;

  @IsUUID()
  @ApiProperty({
    description: 'ID of the document type',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  documentTypeId: string;

  @IsUUID()
  @ApiProperty({
    description: 'ID of the enterprise associated with the document',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  enterpriseId: string;
}
