import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { PagingDefault } from '../../constants';

export class CursorPagingQuery {
  @ApiPropertyOptional({ description: 'Cursor position for pagination' })
  @IsOptional()
  @IsNumber()
  cursor?: number;

  @ApiPropertyOptional({ description: 'Limit for pagination' })
  @IsOptional()
  @IsNumber()
  limit?: number;

  get take(): number {
    return this.limit ?? PagingDefault.limit;
  }
}
