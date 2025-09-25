import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class GeneralReportFilterVisibilityCallDto {
  @ApiPropertyOptional({ nullable: true, description: 'Exclude calls block' })
  @IsOptional()
  @IsBoolean()
  exclude?: boolean | null;
}
