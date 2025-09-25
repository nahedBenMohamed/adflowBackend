import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';
import { CreateMailboxSignatureDto, MailboxSignatureDto, UpdateMailboxSignatureDto } from '../dto';
import { MailboxSignatureMailbox } from './mailbox-signature-mailbox.entity';

@Entity()
export class MailboxSignature {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  createdBy: number;

  @Column()
  name: string;

  @Column()
  text: string;

  @Column({ default: false })
  isHtml: boolean;

  @Column()
  createdAt: Date;

  constructor(accountId: number, createdBy: number, name: string, text: string, isHtml: boolean, createdAt?: Date) {
    this.accountId = accountId;
    this.createdBy = createdBy;
    this.name = name;
    this.text = text;
    this.isHtml = isHtml;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _mailboxes: MailboxSignatureMailbox[] = [];
  get mailboxes(): MailboxSignatureMailbox[] {
    return this._mailboxes;
  }
  set mailboxes(value: MailboxSignatureMailbox[]) {
    this._mailboxes = value;
  }

  static create(accountId: number, createdBy: number, dto: CreateMailboxSignatureDto): MailboxSignature {
    return new MailboxSignature(accountId, createdBy, dto.name, dto.text, dto.isHtml ?? false);
  }

  update(dto: UpdateMailboxSignatureDto): MailboxSignature {
    this.name = dto.name ?? this.name;
    this.text = dto.text ?? this.text;
    this.isHtml = dto.isHtml ?? this.isHtml;

    return this;
  }

  toDto(): MailboxSignatureDto {
    return {
      id: this.id,
      createdBy: this.createdBy,
      name: this.name,
      text: this.text,
      isHtml: this.isHtml,
      linkedMailboxes: this.mailboxes?.map((m) => m.mailboxId) ?? [],
    };
  }
}
