import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { ManualSorting } from '@/common';

export abstract class UpdateBaseTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  responsibleUserId?: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  startDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isResolved?: boolean;

  @ApiPropertyOptional({ type: ManualSorting, nullable: true })
  @IsOptional()
  sorting?: ManualSorting | null;
}
