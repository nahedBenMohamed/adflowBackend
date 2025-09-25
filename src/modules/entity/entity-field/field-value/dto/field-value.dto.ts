import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject } from 'class-validator';

import { FieldType } from '../../common';

export class FieldValueDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  entityId: number;

  @ApiProperty()
  @IsNumber()
  fieldId: number;

  @ApiProperty({ enum: FieldType })
  @IsEnum(FieldType)
  fieldType: FieldType;

  @ApiProperty()
  @IsObject()
  payload: any;

  constructor({ id, entityId, fieldId, fieldType, payload }: FieldValueDto) {
    this.id = id;
    this.entityId = entityId;
    this.fieldId = fieldId;
    this.fieldType = fieldType;
    this.payload = payload;
  }
}
