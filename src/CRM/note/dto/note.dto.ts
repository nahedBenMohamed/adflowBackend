import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

import { FileLinkDto } from '../../Service/FileLink/FileLinkDto';

export class NoteDto {
  @ApiProperty({ description: 'Note ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Entity ID' })
  @IsNumber()
  entityId: number;

  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  createdBy: number;

  @ApiProperty({ description: 'Note text' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Note creation date' })
  @IsDateString()
  createdAt: string;

  @ApiPropertyOptional({ type: [FileLinkDto], nullable: true, description: 'File links' })
  @IsOptional()
  fileLinks?: FileLinkDto[] | null;
}
