import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DateUtil, ForbiddenError, NotFoundError } from '@/common';
import { User } from '@/modules/iam/user/entities/user.entity';

import { MailboxEvent, MailboxState, MailboxSyncResult, MailEventType } from '../../common';
import { MailProviderRegistry } from '../../mail-provider';
import { MailboxFolderService } from '../../mailbox-folder';
import { MailMessageService } from '../../Service/MailMessage/MailMessageService';

import { CreateMailboxDto, UpdateMailboxDto } from '../dto';
import { Mailbox, MailboxAccessibleUser, MailboxEntitySettings } from '../entities';
import { MailboxLockService } from './mailbox-lock.service';
import { MailboxAccessibleUserService } from './mailbox-accessible-user.service';
import { MailboxEntitySettingsService } from './mailbox-entity-settings.service';

interface FindFilter {
  accountId: number;
  mailboxId?: number;
  ownerId?: number;
  state?: MailboxState | MailboxState[];
  accessibleUserId?: number;
  provider?: string;
}

@Injectable()
export class MailboxService {
  private readonly logger = new Logger(MailboxService.name);
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Mailbox)
    private readonly repository: Repository<Mailbox>,
    private readonly mailboxLock: MailboxLockService,
    private readonly mailboxAccessibleUserService: MailboxAccessibleUserService,
    private readonly mailboxEntitySettingsService: MailboxEntitySettingsService,
    private readonly mailProviderRegistry: MailProviderRegistry,
    private readonly mailboxFolderService: MailboxFolderService,
    @Inject(forwardRef(() => MailMessageService))
    private readonly mailMessageService: MailMessageService,
  ) {}

  async create({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: CreateMailboxDto & { state?: MailboxState };
  }): Promise<Mailbox> {
    const mailbox = await this.repository.save(Mailbox.fromDto({ accountId, userId, dto }));

    if (mailbox.state !== MailboxState.Draft) {
      this.syncMailboxWithLock({
        accountId,
        mailboxId: mailbox.id,
        syncFull: mailbox.state === MailboxState.Init,
        syncDays: dto.syncDays,
      });
    }

    return mailbox;
  }

  async findOne(filter: FindFilter): Promise<Mailbox | null> {
    const mailbox = await this.createQb(filter).getOne();

    if (mailbox && filter.accessibleUserId) {
      return mailbox.ownerId === filter.accessibleUserId ||
        mailbox.accessibleUsers?.some((au) => au.userId === filter.accessibleUserId)
        ? mailbox
        : null;
    } else {
      return mailbox;
    }
  }
  async findMany(filter: FindFilter): Promise<Mailbox[]> {
    const mailboxes = await this.createQb(filter).orderBy('mailbox.created_at').getMany();
    return filter.accessibleUserId
      ? mailboxes.filter(
          (mb) =>
            mb.ownerId === filter.accessibleUserId ||
            mb.accessibleUsers?.some((au) => au.userId === filter.accessibleUserId),
        )
      : mailboxes;
  }

  async update({
    accountId,
    user,
    mailboxId,
    dto,
  }: {
    accountId: number;
    user?: User;
    mailboxId: number;
    dto: UpdateMailboxDto;
  }): Promise<Mailbox> {
    const mailbox = await this.findOne({ accountId, mailboxId });
    if (!mailbox) {
      throw NotFoundError.withId(Mailbox, mailboxId);
    }
    if (user && !user.isAdmin && mailbox.ownerId !== user.id) {
      throw new ForbiddenError();
    }

    if (mailbox.state === MailboxState.Draft) {
      mailbox.update({ state: MailboxState.Init });
    }
    await this.repository.save(mailbox.update(dto));

    if (dto.accessibleUserIds) {
      mailbox.accessibleUsers = await this.mailboxAccessibleUserService.update({
        accountId,
        mailboxId,
        currentUsers: mailbox.accessibleUsers ?? [],
        userIds: dto.accessibleUserIds,
      });
    }
    if (dto.entitySettings === null) {
      await this.mailboxEntitySettingsService.delete({ accountId, mailboxId: mailbox.id });
      mailbox.entitySettings = null;
    } else if (dto.entitySettings) {
      mailbox.entitySettings = await this.mailboxEntitySettingsService.update({
        accountId,
        mailboxId: mailbox.id,
        dto: dto.entitySettings,
      });
    }

    this.syncMailboxWithLock({
      accountId,
      mailboxId: mailbox.id,
      syncFull: mailbox.state === MailboxState.Init,
      syncDays: dto.syncDays,
    });

    return mailbox;
  }

  async delete({
    accountId,
    user,
    mailboxId,
    softDelete,
  }: {
    accountId: number;
    user: User;
    mailboxId: number;
    softDelete: boolean;
  }) {
    if (!user.isAdmin) {
      const mailbox = await this.findOne({ accountId, mailboxId });
      if (!mailbox || mailbox.ownerId !== user.id) {
        throw new ForbiddenError();
      }
    }
    if (softDelete) {
      await this.repository.update({ id: mailboxId, accountId }, { state: MailboxState.Deleted });
    } else {
      await this.mailboxLock.waitForUnlock(mailboxId);
      await this.repository.delete({ id: mailboxId, accountId });
    }
    this.eventEmitter.emit(MailEventType.MailboxDeleted, new MailboxEvent({ accountId, mailboxId }));
  }

  async synchronize(state: MailboxState): Promise<number> {
    const mailboxes = await this.findForSync(state);
    mailboxes.forEach(async ({ accountId, mailboxId }) => {
      this.syncMailboxWithLock({ accountId, mailboxId });
    });
    return mailboxes.length;
  }

  private createQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('mailbox')
      .leftJoinAndMapMany('mailbox.accessibleUsers', MailboxAccessibleUser, 'mau', 'mau.mailbox_id = mailbox.id')
      .leftJoinAndMapOne('mailbox.entitySettings', MailboxEntitySettings, 'mes', 'mes.mailbox_id = mailbox.id')
      .where('mailbox.account_id = :accountId', { accountId: filter.accountId });

    if (filter.mailboxId) {
      qb.andWhere('mailbox.id = :mailboxId', { mailboxId: filter.mailboxId });
    }
    if (filter.ownerId) {
      qb.andWhere('mailbox.owner_id = :ownerId', { ownerId: filter.ownerId });
    }
    if (filter.state) {
      if (Array.isArray(filter.state)) {
        qb.andWhere('mailbox.state IN (:...states)', { states: filter.state });
      } else {
        qb.andWhere('mailbox.state = :state', { state: filter.state });
      }
    }
    if (filter.provider) {
      qb.andWhere('mailbox.provider = :provider', { provider: filter.provider });
    }

    return qb;
  }

  private async updateState({
    accountId,
    mailboxId,
    state,
    errorMessage,
    lastActiveAt,
  }: {
    accountId: number;
    mailboxId: number;
    state: MailboxState;
    errorMessage?: string;
    lastActiveAt?: Date;
  }) {
    await this.repository.update(
      { accountId, id: mailboxId },
      { state, errorMessage: errorMessage ?? null, lastActiveAt },
    );
  }

  private async findForSync(state: MailboxState): Promise<{ accountId: number; mailboxId: number }[]> {
    return this.repository
      .createQueryBuilder('mailbox')
      .select('mailbox.id', 'mailboxId')
      .addSelect('mailbox.account_id', 'accountId')
      .where('mailbox.state = :state', { state })
      .getRawMany<{ accountId: number; mailboxId: number }>();
  }

  private async syncMailboxWithLock({
    accountId,
    mailboxId,
    syncFull = false,
    syncDays = null,
  }: {
    accountId: number;
    mailboxId: number;
    syncFull?: boolean | null;
    syncDays?: number | null;
  }) {
    if (!this.mailboxLock.lock(mailboxId)) {
      return;
    }

    try {
      const mailbox = await this.findOne({ accountId, mailboxId });
      const { result, message, folders, messages } = await this.syncMailbox({ mailbox, syncFull, syncDays });
      if (result && folders?.length)
        await this.mailboxFolderService.processExternal({ accountId, mailboxId, extFolders: folders });
      if (result && (messages?.added?.length || messages?.updated?.length || messages?.deleted?.length))
        await this.mailMessageService.processExternalMessages({
          accountId,
          mailbox,
          added: messages.added,
          updated: messages.updated,
          deleted: messages.deleted,
        });
      await this.updateState({
        accountId,
        mailboxId,
        state: result ? MailboxState.Active : MailboxState.Inactive,
        errorMessage: message,
        lastActiveAt: result ? DateUtil.now() : undefined,
      });
    } catch (e) {
      const error = e as Error;
      await this.updateState({
        accountId,
        mailboxId,
        state: MailboxState.Inactive,
        errorMessage: error?.message,
      });
      this.logger.error(`Mailbox ${mailboxId} sync error: ${error?.message}`, error?.stack);
    } finally {
      this.mailboxLock.unlock(mailboxId);
    }
  }

  private async syncMailbox({
    mailbox,
    syncFull = false,
    syncDays = null,
  }: {
    mailbox: Mailbox;
    syncFull?: boolean | null;
    syncDays?: number | null;
  }): Promise<MailboxSyncResult> {
    const provider = this.mailProviderRegistry.get(mailbox.provider);
    const syncDate = syncDays ? DateUtil.sub(DateUtil.now(), { days: syncDays }) : null;

    return provider.sync({ mailbox, syncFull, syncDate });
  }
}
