import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class SiteFormFieldDataDto {
  @ApiProperty({ description: 'Field ID' })
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ description: 'Field value', nullable: true })
  value?: unknown | null;

  @ApiPropertyOptional({ description: 'Field min value', nullable: true })
  @IsOptional()
  min?: unknown | null;

  @ApiPropertyOptional({ description: 'Field max value', nullable: true })
  @IsOptional()
  max?: unknown | null;
}
