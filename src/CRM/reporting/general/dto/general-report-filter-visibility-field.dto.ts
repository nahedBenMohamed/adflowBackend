import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { GeneralReportFilterVisibilityFieldOptionDto } from './general-report-filter-visibility-field-option.dto';

export class GeneralReportFilterVisibilityFieldDto {
  @ApiProperty({ nullable: true, description: 'Field ID' })
  @IsNumber()
  fieldId: number;

  @ApiPropertyOptional({ nullable: true, description: 'Exclude field' })
  @IsOptional()
  @IsBoolean()
  exclude?: boolean | null;

  @ApiPropertyOptional({
    type: GeneralReportFilterVisibilityFieldOptionDto,
    nullable: true,
    description: 'Field options',
  })
  @IsOptional()
  options?: GeneralReportFilterVisibilityFieldOptionDto[] | null;
}
