import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { SiteFormFieldDto } from '../../site-form-field';

export class SiteFormPageDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiProperty()
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ type: [SiteFormFieldDto] })
  @IsArray()
  @Type(() => SiteFormFieldDto)
  fields: SiteFormFieldDto[];
}
