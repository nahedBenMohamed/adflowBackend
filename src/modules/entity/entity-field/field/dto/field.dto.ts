import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { FieldType } from '../../common';
import { FieldOptionDto } from '../../field-option';

import { FieldCode, FieldFormat } from '../enums';

export class FieldDto {
  @ApiProperty({ description: 'Field ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Field name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: FieldType, description: 'Field type' })
  @IsEnum(FieldType)
  type: FieldType;

  @ApiPropertyOptional({ nullable: true, enum: FieldCode, description: 'Field code' })
  @IsOptional()
  @IsEnum(FieldCode)
  code?: FieldCode | null;

  @ApiProperty({ description: 'Field active status' })
  @IsBoolean()
  active: boolean;

  @ApiProperty({ description: 'Field sort order' })
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ description: 'Entity type ID' })
  @IsNumber()
  entityTypeId: number;

  @ApiProperty({ nullable: true, description: 'Field group ID' })
  @IsOptional()
  @IsNumber()
  fieldGroupId: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Field value for formulas' })
  @IsOptional()
  @IsString()
  value?: string | null;

  @ApiPropertyOptional({ enum: FieldFormat, nullable: true, description: 'Field format' })
  @IsOptional()
  @IsEnum(FieldFormat)
  format?: FieldFormat | null;

  @ApiProperty({ type: [FieldOptionDto], description: 'Field options' })
  @IsArray()
  options: FieldOptionDto[] = [];

  constructor({
    id,
    name,
    type,
    code,
    active,
    sortOrder,
    entityTypeId,
    fieldGroupId,
    value,
    format,
    options,
  }: FieldDto) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.code = code;
    this.active = active;
    this.sortOrder = sortOrder;
    this.entityTypeId = entityTypeId;
    this.fieldGroupId = fieldGroupId;
    this.value = value;
    this.format = format;
    this.options = options;
  }
}
