import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class MailMessageFolder {
  @PrimaryColumn()
  messageId: number;

  @PrimaryColumn()
  folderId: number;

  constructor(messageId: number, folderId: number) {
    this.messageId = messageId;
    this.folderId = folderId;
  }
}
