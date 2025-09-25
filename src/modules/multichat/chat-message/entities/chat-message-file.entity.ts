import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { ChatMessageFileDto } from '../dto/chat-message-file.dto';

@Entity()
export class ChatMessageFile {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  messageId: number;

  @Column({ nullable: true })
  externalId: string | null;

  @Column({ nullable: true })
  fileId: string | null;

  @Column()
  name: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  private _downloadUrl: string | null = null;

  constructor(
    accountId: number,
    messageId: number,
    externalId: string | null,
    fileId: string | null,
    name: string,
    mimeType: string,
    size: number,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.messageId = messageId;
    this.externalId = externalId;
    this.fileId = fileId;
    this.name = name;
    this.mimeType = mimeType;
    this.size = size;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public set downloadUrl(downloadUrl: string | null) {
    this._downloadUrl = downloadUrl;
  }
  public get downloadUrl(): string | null {
    return this._downloadUrl;
  }

  public toDto(): ChatMessageFileDto {
    return new ChatMessageFileDto(
      this.id,
      this.fileId,
      this.name,
      this.size,
      this.mimeType,
      this.createdAt.toISOString(),
      this._downloadUrl,
    );
  }
}
