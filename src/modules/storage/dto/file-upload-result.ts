import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class FileUploadResult {
  @ApiPropertyOptional({ description: 'Upload key', nullable: true })
  @IsOptional()
  @IsString()
  key?: string | null;

  @ApiProperty({ description: 'File ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'File name' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'File size' })
  @IsNumber()
  fileSize: number;

  @ApiProperty({ description: 'Mime type' })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional({ description: 'Download URL', nullable: true })
  @IsOptional()
  @IsString()
  downloadUrl?: string | null;

  @ApiPropertyOptional({ description: 'Preview URL', nullable: true })
  @IsOptional()
  @IsString()
  previewUrl?: string | null;

  @ApiProperty({ description: 'Created at' })
  @IsDateString()
  createdAt: string;
}
