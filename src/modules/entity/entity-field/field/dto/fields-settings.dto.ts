import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { FieldCode } from '../enums';

export class FieldsSettingsDto {
  @ApiPropertyOptional({ enum: FieldCode, enumName: 'FieldCode', isArray: true, description: 'Active field codes' })
  @IsOptional()
  @IsArray()
  activeFieldCodes?: FieldCode[];
}
