import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { FileLinkDto } from '../../Service/FileLink/FileLinkDto';
import { NoteDto, UpdateNoteDto } from '../dto';

@Entity('note')
export class Note {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  entityId: number;

  @Column()
  createdBy: number;

  @Column()
  text: string;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(accountId: number, entityId: number, userId: number, text: string, createdAt?: Date) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.createdBy = userId;
    this.text = text;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  update(dto: UpdateNoteDto): Note {
    this.text = dto.text !== undefined ? dto.text : this.text;

    return this;
  }

  toDto(fileLinks?: FileLinkDto[] | null): NoteDto {
    return {
      id: this.id,
      entityId: this.entityId,
      createdBy: this.createdBy,
      text: this.text,
      createdAt: this.createdAt.toISOString(),
      fileLinks: fileLinks,
    };
  }
}
