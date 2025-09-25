import { ApiProperty } from '@nestjs/swagger';

export class ActivityCardTypeMetaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  totalCount: number;

  constructor(id: number, totalCount: number) {
    this.id = id;
    this.totalCount = totalCount;
  }
}
