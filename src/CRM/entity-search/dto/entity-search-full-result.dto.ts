import { ApiProperty } from '@nestjs/swagger';

import { PagingMeta } from '@/common';
import { EntityDto } from '../../Service/Entity/Dto/EntityDto';

export class EntitySearchFullResultDto {
  @ApiProperty({ description: 'List of entities', type: [EntityDto], nullable: true })
  entities: EntityDto[] | null;

  @ApiProperty({ description: 'Paging metadata', type: PagingMeta })
  meta: PagingMeta;
}
