import { ApiProperty } from '@nestjs/swagger';

import { MailMessageInfo } from './MailMessageInfo';

export class MailThreadInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  messages: MailMessageInfo[];

  constructor(id: string, messages: MailMessageInfo[]) {
    this.id = id;
    this.messages = messages;
  }
}
