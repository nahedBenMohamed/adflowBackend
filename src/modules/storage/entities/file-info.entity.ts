import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { imageMimeTypes, MimeType } from '../enums/mime-type.enum';

@Entity()
export class FileInfo {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  createdBy: number | null;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  hashSha256: string | null;

  @Column()
  storePath: string;

  @Column()
  isUsed: boolean;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    id: string,
    accountId: number,
    createdBy: number | null,
    originalName: string,
    mimeType: string,
    size: number,
    hashSha256: string,
    storePath: string,
    isUsed: boolean,
    createdAt?: Date,
  ) {
    this.id = id;
    this.accountId = accountId;
    this.createdBy = createdBy;
    this.originalName = originalName;
    this.mimeType = mimeType;
    this.size = size;
    this.hashSha256 = hashSha256;
    this.storePath = storePath;
    this.isUsed = isUsed;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public isImage(): boolean {
    return imageMimeTypes.includes(this.mimeType as MimeType);
  }
}
