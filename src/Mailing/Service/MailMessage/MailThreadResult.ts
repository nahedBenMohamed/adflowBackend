import { ApiProperty } from '@nestjs/swagger';

import { PagingMeta } from '@/common';
import { MailThreadInfo } from './MailThreadInfo';

export class MailThreadResult {
  @ApiProperty()
  threads: MailThreadInfo[];

  @ApiProperty()
  meta: PagingMeta;

  constructor(threads: MailThreadInfo[], meta: PagingMeta) {
    this.threads = threads;
    this.meta = meta;
  }
}
