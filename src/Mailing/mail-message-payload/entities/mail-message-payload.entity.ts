import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { MailMessagePayloadExternal } from '../../common';
import { MailMessagePayloadDto } from '../dto';

@Entity()
export class MailMessagePayload {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  messageId: number;

  @Column({ nullable: true })
  externalId: string | null;

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  filename: string | null;

  @Column({ nullable: true })
  attachment: string | null;

  @Column({ nullable: true })
  content: string | null;

  @Column({ nullable: true })
  size: number | null;

  @Column()
  sortOrder: number;

  @Column()
  accountId: number;

  constructor(
    accountId: number,
    messageId: number,
    externalId: string | null,
    mimeType: string,
    filename: string | null,
    attachment: string | null,
    content: string | null,
    size: number | null,
    sortOrder: number,
  ) {
    this.accountId = accountId;
    this.messageId = messageId;
    this.externalId = externalId;
    this.mimeType = mimeType;
    this.filename = filename;
    this.attachment = attachment;
    this.content = content;
    this.size = size;
    this.sortOrder = sortOrder;
  }

  static fromExternal(
    accountId: number,
    messageId: number,
    sortOrder: number,
    payload: MailMessagePayloadExternal,
  ): MailMessagePayload {
    return new MailMessagePayload(
      accountId,
      messageId,
      payload.id,
      payload.mimeType,
      payload.filename,
      payload.attachmentId,
      payload.content,
      payload.size,
      sortOrder,
    );
  }

  toDto(): MailMessagePayloadDto {
    return {
      id: this.id,
      mimeType: this.mimeType,
      filename: this.filename,
      content: this.content,
      size: this.size,
      sortOrder: this.sortOrder,
    };
  }
}
