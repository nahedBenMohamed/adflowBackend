import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { CrmGeneralReportFieldOptionMetaDto } from './crm-general-report-field-option-meta.dto';

export class CrmGeneralReportFieldMetaDto {
  @ApiProperty()
  @IsNumber()
  fieldId: number;

  @ApiProperty()
  @IsString()
  fieldName: string;

  @ApiPropertyOptional({ type: [CrmGeneralReportFieldOptionMetaDto], nullable: true })
  @IsOptional()
  @IsArray()
  values?: CrmGeneralReportFieldOptionMetaDto[] | null;
}
