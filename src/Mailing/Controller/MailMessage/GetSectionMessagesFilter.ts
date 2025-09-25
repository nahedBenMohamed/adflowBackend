import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { PagingQuery } from '@/common';

export class GetSectionMessagesFilter extends PagingQuery {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  mailboxId?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;
}
