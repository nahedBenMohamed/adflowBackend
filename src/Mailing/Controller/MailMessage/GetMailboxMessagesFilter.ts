import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { PagingQuery } from '@/common';

export class GetMailboxMessagesFilter extends PagingQuery {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  folderId?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search?: string;
}
