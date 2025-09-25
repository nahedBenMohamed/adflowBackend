import { ApiProperty } from '@nestjs/swagger';

import { PagingMeta } from '@/common';
import { EntityInfoDto } from '@/modules/entity/entity-info';

export class EntitySearchResultDto {
  @ApiProperty({ description: 'List of entities', type: [EntityInfoDto], nullable: true })
  entities: EntityInfoDto[] | null;

  @ApiProperty({ description: 'Paging metadata', type: PagingMeta })
  meta: PagingMeta;
}
