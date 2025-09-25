import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { MailboxFolderExternal, MailboxFolderType } from '../../common';
import { MailboxFolderDto } from '../dto';

@Entity()
export class MailboxFolder {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  mailboxId: number;

  @Column({ nullable: true })
  parentId: number | null;

  @Column()
  externalId: string;

  @Column({ nullable: true })
  uidValidity: number | null;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: MailboxFolderType | null;

  @Column({ nullable: true })
  unread: number | null;

  @Column({ nullable: true })
  total: number | null;

  constructor(
    accountId: number,
    mailboxId: number,
    parentId: number | null,
    externalId: string,
    uidValidity: number | null,
    name: string,
    type: MailboxFolderType | null,
    unread?: number | null,
    total?: number | null,
  ) {
    this.accountId = accountId;
    this.mailboxId = mailboxId;
    this.parentId = parentId;
    this.externalId = externalId;
    this.uidValidity = uidValidity;
    this.name = name;
    this.type = type;
    this.unread = unread;
    this.total = total;
  }

  private _folders: MailboxFolder[];
  get folders(): MailboxFolder[] {
    return this._folders;
  }
  set folders(value: MailboxFolder[]) {
    this._folders = value;
  }

  static fromExternal({
    accountId,
    mailboxId,
    parentId,
    external,
  }: {
    accountId: number;
    mailboxId: number;
    parentId?: number | null;
    external: MailboxFolderExternal;
  }): MailboxFolder {
    return new MailboxFolder(
      accountId,
      mailboxId,
      parentId ?? null,
      external.id,
      external.uidValidity,
      external.name,
      external.type,
    );
  }

  hasChanges(data: { parentId?: number | null } & Partial<MailboxFolderExternal>): boolean {
    return (
      (data.parentId !== undefined && data.parentId !== this.parentId) ||
      (data.id !== undefined && data.id !== this.externalId) ||
      (data.uidValidity !== undefined && data.uidValidity !== this.uidValidity) ||
      (data.name !== undefined && data.name !== this.name) ||
      (data.type !== undefined && data.type !== this.type)
    );
  }

  update(data: { parentId?: number | null } & Partial<MailboxFolderExternal>): MailboxFolder {
    this.parentId = data.parentId !== undefined ? data.parentId : this.parentId;
    this.externalId = data.id !== undefined ? data.id : this.externalId;
    this.uidValidity = data.uidValidity !== undefined ? data.uidValidity : this.uidValidity;
    this.name = data.name !== undefined ? data.name : this.name;
    this.type = data.type !== undefined ? data.type : this.type;

    return this;
  }

  toUpdate(): Pick<MailboxFolder, 'parentId' | 'externalId' | 'uidValidity' | 'name' | 'type'> {
    return {
      parentId: this.parentId,
      externalId: this.externalId,
      uidValidity: this.uidValidity,
      name: this.name,
      type: this.type,
    };
  }

  toDto(): MailboxFolderDto {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      unread: this.unread,
      total: this.total,
      folders: this.folders?.map((f) => f.toDto()),
    };
  }
}
