import { ApiProperty } from '@nestjs/swagger';

import { PagingMeta } from '@/common';
import { EntityEventDataDto } from './entity-event-data.dto';

export class GetEntityEventResult {
  @ApiProperty({ type: [EntityEventDataDto] })
  result: EntityEventDataDto[];

  @ApiProperty()
  meta: PagingMeta;

  constructor(result: EntityEventDataDto[], meta: PagingMeta) {
    this.result = result;
    this.meta = meta;
  }
}
