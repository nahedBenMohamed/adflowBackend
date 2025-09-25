import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PublicSiteFormFieldScheduleDateDto {
  @ApiPropertyOptional({ type: [String], nullable: true, description: 'Dates in ISO format' })
  @IsOptional()
  @IsString({ each: true })
  dates?: string[] | null;
}
