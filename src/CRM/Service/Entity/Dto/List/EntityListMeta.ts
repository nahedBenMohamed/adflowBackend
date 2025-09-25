import { ApiProperty } from '@nestjs/swagger';

export class EntityListMeta {
  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  hasPrice: boolean;

  @ApiProperty({ nullable: true })
  totalPrice: number | null;
}
