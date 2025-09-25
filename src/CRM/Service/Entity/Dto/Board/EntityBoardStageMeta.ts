import { ApiProperty } from '@nestjs/swagger';

export class EntityBoardStageMeta {
  @ApiProperty()
  id: number;

  @ApiProperty()
  totalCount: number;

  @ApiProperty({ nullable: true })
  totalPrice: number | null;
}
