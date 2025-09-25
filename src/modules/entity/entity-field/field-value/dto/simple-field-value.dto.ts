import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

import { FieldType } from '../../common';

export class SimpleFieldValueDto {
  @ApiPropertyOptional({ enum: FieldType, description: 'Field type' })
  @IsOptional()
  @IsEnum(FieldType)
  fieldType?: FieldType;

  @ApiPropertyOptional({ description: 'Field name' })
  @IsOptional()
  @IsString()
  fieldName?: string;

  @ApiPropertyOptional({ description: 'Field ID' })
  @IsOptional()
  @IsNumber()
  fieldId?: number;

  @ApiPropertyOptional({ description: 'Field code' })
  @IsOptional()
  @IsString()
  fieldCode?: string;

  @ApiPropertyOptional({ description: 'Payload' })
  @IsOptional()
  @IsObject()
  payload?: unknown;

  @ApiPropertyOptional({ description: 'Value' })
  @IsOptional()
  @IsObject()
  value?: unknown;
}
