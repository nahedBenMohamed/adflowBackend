import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

import { CrmGeneralReportFieldValueDto } from './crm-general-report-field-value.dto';

export class CrmGeneralReportFieldDto {
  @ApiProperty()
  @IsNumber()
  fieldId: number;

  @ApiProperty()
  @IsString()
  fieldName: string;

  @ApiProperty({ type: [CrmGeneralReportFieldValueDto] })
  @IsArray()
  values: CrmGeneralReportFieldValueDto[];

  constructor(fieldId: number, fieldName: string, values: CrmGeneralReportFieldValueDto[]) {
    this.fieldId = fieldId;
    this.fieldName = fieldName;
    this.values = values;
  }
}
