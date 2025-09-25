import { Message } from '../../types';

export class SendMessageEvent {
  accountId: number;
  message: Message;

  constructor({ accountId, message }: SendMessageEvent) {
    this.accountId = accountId;
    this.message = message;
  }
}
