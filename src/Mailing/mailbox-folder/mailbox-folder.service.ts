import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { flattenTree } from '@/common';

import { detectMailboxFolderType, MailboxFolderExternal, MailboxFolderType } from '../common';
import { MailMessage } from '../Model/MailMessage/MailMessage';
import { MailMessageFolder } from '../Model/MailMessage/MailMessageFolder';

import { MailboxFolder } from './entities';

interface FindFilter {
  accountId: number;
  mailboxId?: number;
  folderId?: number;
  type?: MailboxFolderType | MailboxFolderType[];
  externalId?: string | string[];
  messageId?: number;
  parentId?: number | null;
}

@Injectable()
export class MailboxFolderService {
  constructor(
    @InjectRepository(MailboxFolder)
    private readonly repository: Repository<MailboxFolder>,
  ) {}

  async findOne(filter: FindFilter): Promise<MailboxFolder | null> {
    return this.createQb(filter).getOne();
  }

  async findMany(filter: FindFilter): Promise<MailboxFolder[]> {
    return this.createQb(filter).orderBy('mf.id', 'ASC').getMany();
  }

  async getHierarchy({
    accountId,
    mailboxId,
    folderId,
  }: {
    accountId: number;
    mailboxId: number;
    folderId?: number | null;
  }): Promise<MailboxFolder[]> {
    const folders = await this.findMany({ accountId, mailboxId, parentId: folderId ?? null });
    for (const folder of folders) {
      const children = await this.getHierarchy({ accountId, mailboxId, folderId: folder.id });
      folder.folders = children?.length ? children : undefined;
    }
    return folders;
  }

  async processExternal({
    accountId,
    mailboxId,
    extFolders,
  }: {
    accountId: number;
    mailboxId: number;
    extFolders: MailboxFolderExternal[];
  }) {
    const extFlatten = flattenTree(extFolders, (item) => item.folders);
    this.postprocessTypes(extFlatten);

    const currentFolders = await this.findMany({ accountId, mailboxId });
    const currentFoldersMap = new Map(currentFolders.map((f) => [f.externalId, f]));

    const processedIds = await this.processHierarchy({
      accountId,
      mailboxId,
      currentFolders,
      currentFoldersMap,
      extFolders,
    });

    await this.repository.delete({ accountId, mailboxId, id: processedIds.length ? Not(In(processedIds)) : undefined });
  }

  async actualizeCounters({ accountId, mailboxId }: { accountId: number; mailboxId: number }) {
    const folders = await this.repository
      .createQueryBuilder('mf')
      .select('mf.id', 'id')
      .addSelect('count(mm.id)', 'total')
      .addSelect('count(mm.id) filter (where mm.is_seen = false)', 'unread')
      .leftJoin(MailMessageFolder, 'mmf', 'mmf.folder_id = mf.id')
      .leftJoin(MailMessage, 'mm', 'mm.id = mmf.message_id')
      .where('mf.account_id = :accountId', { accountId })
      .andWhere('mf.mailbox_id = :mailboxId', { mailboxId })
      .groupBy('mf.id')
      .getRawMany<{ id: number; total: number; unread: number }>();

    await Promise.all(
      folders.map((folder) =>
        this.repository.update({ accountId, id: folder.id }, { total: folder.total, unread: folder.unread }),
      ),
    );
  }

  private createQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('mf')
      .where('mf.account_id = :accountId', { accountId: filter.accountId });
    if (filter.folderId) {
      qb.andWhere('mf.id = :folderId', { folderId: filter.folderId });
    }
    if (filter.mailboxId) {
      qb.andWhere('mf.mailbox_id = :mailboxId', { mailboxId: filter.mailboxId });
    }
    if (filter.type) {
      if (Array.isArray(filter.type)) {
        qb.andWhere('mf.type IN (:...types)', { types: filter.type });
      } else {
        qb.andWhere('mf.type = :type', { type: filter.type });
      }
    }
    if (filter.externalId) {
      if (Array.isArray(filter.externalId)) {
        qb.andWhere('mf.external_id IN (:...externalIds)', { externalIds: filter.externalId });
      } else {
        qb.andWhere('mf.external_id = :externalId', { externalId: filter.externalId });
      }
    }
    if (filter.messageId) {
      qb.leftJoin(MailMessageFolder, 'mmf', 'mmf.folder_id = mf.id');
      qb.andWhere('mmf.message_id = :messageId', { messageId: filter.messageId });
    }
    if (filter.parentId !== undefined) {
      if (filter.parentId === null) {
        qb.andWhere('mf.parent_id IS NULL');
      } else {
        qb.andWhere('mf.parent_id = :parentId', { parentId: filter.parentId });
      }
    }
    return qb;
  }

  private postprocessTypes(flatten: MailboxFolderExternal[]) {
    const types = new Set<MailboxFolderType>(flatten.map((f) => f.type).filter(Boolean));
    if (!types.size) {
      for (const folder of flatten) {
        if (!folder.type) {
          const type = detectMailboxFolderType({ name: folder.name });
          if (type && !types.has(type)) {
            folder.type = type;
            types.add(type);
          }
        }
      }
    }
  }

  private async processHierarchy({
    accountId,
    mailboxId,
    currentFolders,
    currentFoldersMap,
    extFolders,
    parentId = null,
  }: {
    accountId: number;
    mailboxId: number;
    currentFolders: MailboxFolder[];
    currentFoldersMap: Map<string, MailboxFolder>;
    extFolders: MailboxFolderExternal[];
    parentId?: number | null;
  }): Promise<number[]> {
    const processedIds: number[] = [];
    for (const extFolder of extFolders) {
      let folder = this.findCurrentFolder({ extFolder, currentFolders, currentFoldersMap });
      if (folder) {
        if (folder.hasChanges({ parentId, ...extFolder })) {
          await this.repository.update(
            { accountId, mailboxId, id: folder.id },
            folder.update({ parentId, ...extFolder }).toUpdate(),
          );
        }
      } else {
        folder = await this.repository.save(
          MailboxFolder.fromExternal({ accountId, mailboxId, parentId, external: extFolder }),
        );
      }
      processedIds.push(folder.id);
      if (extFolder.folders?.length) {
        const childrenIds = await this.processHierarchy({
          accountId,
          mailboxId,
          currentFolders,
          currentFoldersMap,
          extFolders: extFolder.folders,
          parentId: folder.id,
        });
        processedIds.push(...childrenIds);
      }
    }
    return processedIds;
  }

  private findCurrentFolder({
    extFolder,
    currentFoldersMap,
    currentFolders,
  }: {
    extFolder: MailboxFolderExternal;
    currentFoldersMap: Map<string, MailboxFolder>;
    currentFolders: MailboxFolder[];
  }): MailboxFolder | undefined {
    const folderById = currentFoldersMap.get(extFolder.id);

    if (!extFolder.uidValidity || (folderById && !folderById.uidValidity)) {
      return folderById;
    }

    if (folderById?.uidValidity === extFolder.uidValidity) {
      return folderById;
    }

    const foldersByUidValidity = currentFolders.filter((f) => f.uidValidity === extFolder.uidValidity);

    return foldersByUidValidity.length === 1 ? foldersByUidValidity[0] : null;
  }
}
