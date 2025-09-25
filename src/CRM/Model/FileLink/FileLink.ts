import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { FileLinkSource } from '@/common';

import { imageMimeTypes, MimeType } from '@/modules/storage/enums/mime-type.enum';

@Entity()
export class FileLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sourceType: FileLinkSource;

  @Column()
  sourceId: number;

  @Column()
  fileId: string;

  @Column()
  fileName: string;

  @Column()
  fileSize: number;

  @Column()
  fileType: string;

  @Column()
  createdBy: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    sourceType: FileLinkSource,
    sourceId: number,
    fileId: string,
    fileName: string,
    fileSize: number,
    fileType: string,
    createdBy: number,
    createdAt: Date,
  ) {
    this.accountId = accountId;
    this.sourceType = sourceType;
    this.sourceId = sourceId;
    this.fileId = fileId;
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.fileType = fileType;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
  }

  public isImage(): boolean {
    return imageMimeTypes.includes(this.fileType as MimeType);
  }
}
