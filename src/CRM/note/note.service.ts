import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotFoundError, FileLinkSource } from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { EntityInfoService } from '@/modules/entity/entity-info/entity-info.service';

import { CrmEventType, NoteCreatedEvent, NoteEvent } from '../common';
import { FileLinkService } from '../Service/FileLink/FileLinkService';

import { Note } from './entities';
import { CreateNoteDto, NoteDto, UpdateNoteDto } from './dto';

interface CreateOptions {
  createdAt?: Date;
}
interface FindFilterDto {
  noteId?: number;
  entityId?: number;
}
interface FindFilter extends FindFilterDto {
  accountId: number;
}

@Injectable()
export class NoteService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Note)
    private readonly repository: Repository<Note>,
    private readonly fileLinkService: FileLinkService,
    private readonly entityInfoService: EntityInfoService,
  ) {}

  async create({
    accountId,
    userId,
    entityId,
    dto,
    options,
  }: {
    accountId: number;
    userId: number;
    entityId: number;
    dto: CreateNoteDto;
    options?: CreateOptions;
  }): Promise<Note> {
    const note = await this.repository.save(new Note(accountId, entityId, userId, dto.text, options?.createdAt));
    if (dto.fileIds) {
      await this.fileLinkService.processFiles(accountId, FileLinkSource.NOTE, note.id, dto.fileIds);
    }

    const entityInfo = await this.entityInfoService.findOne({ accountId, entityId });
    this.eventEmitter.emit(
      CrmEventType.NoteCreated,
      new NoteCreatedEvent({
        accountId,
        entityId: entityInfo.id,
        entityName: entityInfo.name,
        createdBy: userId,
        ownerId: entityInfo.ownerId,
        noteId: note.id,
        noteText: note.text,
        createdAt: note.createdAt.toISOString(),
      }),
    );

    return note;
  }

  async createAndGetDto({
    account,
    userId,
    entityId,
    dto,
  }: {
    account: Account;
    userId: number;
    entityId: number;
    dto: CreateNoteDto;
  }): Promise<NoteDto> {
    const note = await this.create({ accountId: account.id, userId, entityId, dto });

    return this.createDtoForNote({ account, note });
  }

  async findOne(filter: FindFilter): Promise<Note | null> {
    return this.createFindQb(filter).getOne();
  }
  async findMany(filter: FindFilter): Promise<Note[]> {
    return this.createFindQb(filter).orderBy('note.created_at', 'DESC').getMany();
  }

  async findOneDto({ account, filter }: { account: Account; filter: FindFilterDto }): Promise<NoteDto | null> {
    const note = await this.findOne({ accountId: account.id, ...filter });

    return note ? this.createDtoForNote({ account, note }) : null;
  }
  async findManyDto({ account, filter }: { account: Account; filter: FindFilterDto }): Promise<NoteDto[]> {
    const notes = await this.findMany({ accountId: account.id, ...filter });

    return Promise.all(notes.map((note) => this.createDtoForNote({ account, note })));
  }

  async update({
    accountId,
    entityId,
    noteId,
    dto,
  }: {
    accountId: number;
    entityId: number;
    noteId: number;
    dto: UpdateNoteDto;
  }): Promise<Note> {
    const note = await this.findOne({ accountId, entityId, noteId });
    if (!note) {
      throw NotFoundError.withId(Note, noteId);
    }
    await this.repository.save(note.update(dto));

    if (dto.fileIds) {
      await this.fileLinkService.processFiles(accountId, FileLinkSource.NOTE, noteId, dto.fileIds);
    }

    return note;
  }

  async updateAndGetDto({
    account,
    entityId,
    noteId,
    dto,
  }: {
    account: Account;
    entityId: number;
    noteId: number;
    dto: UpdateNoteDto;
  }): Promise<NoteDto> {
    const note = await this.update({ accountId: account.id, entityId, noteId, dto });

    return this.createDtoForNote({ account, note });
  }

  async delete({ accountId, entityId, noteId }: { accountId: number; entityId: number; noteId: number }) {
    const note = await this.findOne({ accountId, entityId, noteId });
    if (!note) {
      throw NotFoundError.withId(Note, noteId);
    }

    await this.fileLinkService.processFiles(accountId, FileLinkSource.NOTE, noteId, []);
    await this.repository.delete({ accountId, entityId, id: noteId });

    this.eventEmitter.emit(
      CrmEventType.NoteDeleted,
      new NoteEvent({ accountId: accountId, entityId: entityId, noteId: note.id }),
    );
  }

  async copyEntityNotes({
    accountId,
    sourceEntityId,
    targetEntityId,
  }: {
    accountId: number;
    sourceEntityId: number;
    targetEntityId: number;
  }) {
    const notes = await this.findMany({ accountId, entityId: sourceEntityId });
    await Promise.all(
      notes.map((note) =>
        this.create({
          accountId,
          userId: note.createdBy,
          entityId: targetEntityId,
          dto: { text: note.text },
          options: { createdAt: note.createdAt },
        }),
      ),
    );
  }

  private async createDtoForNote({ account, note }: { account: Account; note: Note }): Promise<NoteDto> {
    const links = await this.fileLinkService.getFileLinkDtos(account, FileLinkSource.NOTE, note.id);

    return note.toDto(links);
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('note')
      .where('note.accountId = :accountId', { accountId: filter.accountId });

    if (filter?.noteId) {
      qb.andWhere('note.id = :noteId', { noteId: filter.noteId });
    }
    if (filter?.entityId) {
      qb.andWhere('note.entityId = :entityId', { entityId: filter.entityId });
    }

    return qb;
  }
}
