import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';

import { PagingMeta } from '@/common';
import { VoximplantCallDto } from './voximplant-call.dto';

export class VoximplantCallListDto {
  @ApiProperty({ type: [VoximplantCallDto] })
  @IsArray()
  calls: VoximplantCallDto[];

  @ApiProperty({ type: PagingMeta })
  @IsObject()
  meta: PagingMeta;

  constructor(calls: VoximplantCallDto[], meta: PagingMeta) {
    this.calls = calls;
    this.meta = meta;
  }
}
