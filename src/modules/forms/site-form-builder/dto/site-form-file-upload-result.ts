import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class SiteFormFileUploadResult {
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

  @ApiProperty({ description: 'Created at' })
  @IsDateString()
  createdAt: string;
}
