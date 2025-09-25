import { ApiProperty } from '@nestjs/swagger';

import { ActivityCardTypeMetaDto } from './activity-card-type-meta.dto';

export class ActivityCardMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty({ type: [ActivityCardTypeMetaDto] })
  types: ActivityCardTypeMetaDto[];

  @ApiProperty()
  resolvedTotal: number;

  constructor(total: number, types: ActivityCardTypeMetaDto[], resolvedTotal: number) {
    this.total = total;
    this.types = types;
    this.resolvedTotal = resolvedTotal;
  }
}
