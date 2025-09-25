import { ApiProperty } from '@nestjs/swagger';

import { EntityBoardStageMeta } from './EntityBoardStageMeta';

export class EntityBoardMeta {
  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  hasPrice: boolean;

  @ApiProperty({ nullable: true })
  totalPrice: number | null;

  @ApiProperty({ type: [EntityBoardStageMeta] })
  stages: EntityBoardStageMeta[];
}
