import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { PagingDefault } from '../../constants';

export class PagingQuery {
  @ApiPropertyOptional({ description: 'Offset', example: 0 })
  @IsOptional()
  @IsNumber()
  offset?: number;

  @ApiPropertyOptional({ description: 'Limit', example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  constructor(offset: number | undefined, limit: number | undefined) {
    this.offset = offset;
    this.limit = limit;
  }

  static default(): PagingQuery {
    return new PagingQuery(undefined, undefined);
  }

  get skip(): number {
    return this.offset ?? PagingDefault.offset;
  }

  get take(): number {
    return this.limit ?? PagingDefault.limit;
  }
}
