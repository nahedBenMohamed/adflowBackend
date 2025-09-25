import { Injectable } from '@nestjs/common';

import { UserService } from '@/modules/iam/user/user.service';
import { StorageService } from '@/modules/storage/storage.service';
import { StorageFile } from '@/modules/storage/types/storage-file';

import { MailboxFolderType, MailboxState, SendMailMessageDto } from '../../common';
import { Mailbox } from '../../mailbox/entities';
import { MailboxService as MailboxSettingsService } from '../../mailbox/services';
import { MailboxFolderService } from '../../mailbox-folder';
import { MailProviderRegistry } from '../../mail-provider';

import { MailMessageService } from '../MailMessage/MailMessageService';

import { MailboxesInfoDto } from './Dto/mailboxes-info.dto';
import { MailboxSectionDto } from './Dto/mailbox-section.dto';
import { MailboxFullInfoDto } from './Dto/mailbox-full-info.dto';

@Injectable()
export class MailboxService {
  constructor(
    private readonly storageService: StorageService,
    private readonly mailboxSettingsService: MailboxSettingsService,
    private readonly mailboxFolderService: MailboxFolderService,
    private readonly mailMessageService: MailMessageService,
    private readonly mailProviderRegistry: MailProviderRegistry,
    private readonly userService: UserService,
  ) {}

  async getMailboxesForInfo(accountId: number, userId: number): Promise<MailboxesInfoDto> {
    const accessibleMailboxes = await this.mailboxSettingsService.findMany({
      accountId,
      accessibleUserId: userId,
      state: [MailboxState.Active, MailboxState.Inactive],
    });

    const folderTypes = Object.values(MailboxFolderType);
    const sections = folderTypes.map((type) => new MailboxSectionDto(type));
    const mailboxes: MailboxFullInfoDto[] = [];
    for (const mailbox of accessibleMailboxes.sort((mb1, mb2) => mb1.id - mb2.id)) {
      const hierarchy = await this.mailboxFolderService.getHierarchy({ accountId, mailboxId: mailbox.id });
      mailboxes.push(
        MailboxFullInfoDto.create(
          mailbox,
          hierarchy.map((f) => f.toDto()),
        ),
      );

      const typed = await this.mailboxFolderService.findMany({ accountId, mailboxId: mailbox.id, type: folderTypes });
      for (const folder of typed) {
        const section = sections.find((ms) => ms.type === folder.type);
        if (section) {
          section.addMailboxInfo({
            id: mailbox.id,
            name: mailbox.email,
            unread: folder.unread,
            total: folder.total,
            state: mailbox.state,
          });
        }
      }
    }
    return { sections, mailboxes };
  }

  async sendMessage(
    accountId: number,
    userId: number,
    mailboxId: number,
    dto: SendMailMessageDto,
    attachments?: StorageFile[] | null,
    senderUserId?: number,
  ): Promise<boolean> {
    const mailbox = await this.mailboxSettingsService.findOne({ accountId, mailboxId, accessibleUserId: userId });

    return mailbox ? this.sendMessageForMailbox(accountId, mailbox, dto, attachments, senderUserId) : false;
  }

  async sendMessageForMailbox(
    accountId: number,
    mailbox: Mailbox,
    dto: SendMailMessageDto,
    attachments?: StorageFile[] | null,
    senderUserId?: number,
  ): Promise<boolean> {
    const replyToMessage = dto.replyToMessageId
      ? await this.mailMessageService.findById(accountId, mailbox.id, dto.replyToMessageId)
      : null;

    const files = dto.fileIds?.length > 0 ? await this.getMessageFiles(accountId, dto.fileIds) : [];
    const allAttachments = [...files, ...(attachments || [])];

    const sendFrom = await this.userService.findOne({
      accountId: mailbox.accountId,
      id: senderUserId ?? mailbox.ownerId,
    });

    const provider = this.mailProviderRegistry.get(mailbox.provider);
    const message = await provider.send({
      accountId,
      mailbox,
      userName: sendFrom.fullName,
      dto,
      replyToMessage,
      attachments: allAttachments,
    });

    if (message) {
      await this.mailMessageService.processExternalMessages({ accountId, mailbox, added: [message] });
      await this.mailboxFolderService.actualizeCounters({ accountId, mailboxId: mailbox.id });

      return true;
    }

    return false;
  }

  private async getMessageFiles(accountId: number, fileIds: string[]): Promise<StorageFile[]> {
    const attachments: StorageFile[] = [];

    for (const fileId of fileIds) {
      const { file, content } = await this.storageService.getFile({ fileId, accountId });
      const buffer = Buffer.from(content.buffer);
      attachments.push(StorageFile.fromFileInfo(file, buffer));
    }

    return attachments;
  }

  async trashThread(accountId: number, userId: number, mailboxId: number, messageId: number): Promise<boolean> {
    const mailbox = await this.mailboxSettingsService.findOne({ accountId, mailboxId, accessibleUserId: userId });
    const message = await this.mailMessageService.getById(accountId, mailbox.id, messageId);
    const provider = this.mailProviderRegistry.get(mailbox.provider);
    let result = false;
    if (provider.isCapable('thread')) {
      result = await provider.trash({ mailbox, messages: { threadId: message.threadId } });
    } else {
      const messages = await this.mailMessageService.getByThreadIdGroupByFolder(
        accountId,
        mailbox.id,
        message.threadId,
      );
      result = await provider.trash({ mailbox, messages });
    }
    if (result) {
      await this.mailMessageService.moveThreadToSpecialFolder(
        accountId,
        mailbox.id,
        message.threadId,
        MailboxFolderType.Trash,
      );
      await this.mailboxFolderService.actualizeCounters({ accountId, mailboxId: mailbox.id });
    }
    return result;
  }

  async untrashThread(accountId: number, userId: number, mailboxId: number, messageId: number): Promise<boolean> {
    const mailbox = await this.mailboxSettingsService.findOne({ accountId, mailboxId, accessibleUserId: userId });
    const message = await this.mailMessageService.getById(accountId, mailbox.id, messageId);
    const provider = this.mailProviderRegistry.get(mailbox.provider);
    let result = false;
    if (provider.isCapable('thread')) {
      result = await provider.untrash({ mailbox, messages: { threadId: message.threadId } });
    } else {
      const messages = await this.mailMessageService.getByThreadIdGroupByFolder(
        accountId,
        mailbox.id,
        message.threadId,
      );
      result = await provider.untrash({ mailbox, messages });
    }
    if (result) {
      await this.mailMessageService.moveThreadToSpecialFolder(
        accountId,
        mailbox.id,
        message.threadId,
        MailboxFolderType.Inbox,
      );
      await this.mailboxFolderService.actualizeCounters({ accountId, mailboxId: mailbox.id });
    }
    return result;
  }

  async spamThread(accountId: number, userId: number, mailboxId: number, messageId: number): Promise<boolean> {
    const mailbox = await this.mailboxSettingsService.findOne({ accountId, mailboxId, accessibleUserId: userId });
    const message = await this.mailMessageService.getById(accountId, mailbox.id, messageId);
    const provider = this.mailProviderRegistry.get(mailbox.provider);
    let result = false;
    if (provider.isCapable('thread')) {
      result = await provider.spam({ mailbox, messages: { threadId: message.threadId } });
    } else {
      const messages = await this.mailMessageService.getByThreadIdGroupByFolder(
        accountId,
        mailbox.id,
        message.threadId,
      );
      result = await provider.spam({ mailbox, messages });
    }
    if (result) {
      await this.mailMessageService.moveThreadToSpecialFolder(
        accountId,
        mailbox.id,
        message.threadId,
        MailboxFolderType.Junk,
      );
      await this.mailboxFolderService.actualizeCounters({ accountId, mailboxId: mailbox.id });
    }
    return result;
  }

  async unspamThread(accountId: number, userId: number, mailboxId: number, messageId: number): Promise<boolean> {
    const mailbox = await this.mailboxSettingsService.findOne({ accountId, mailboxId, accessibleUserId: userId });
    const message = await this.mailMessageService.getById(accountId, mailbox.id, messageId);
    const provider = this.mailProviderRegistry.get(mailbox.provider);
    let result = false;
    if (provider.isCapable('thread')) {
      result = await provider.unspam({ mailbox, messages: { threadId: message.threadId } });
    } else {
      const messages = await this.mailMessageService.getByThreadIdGroupByFolder(
        accountId,
        mailbox.id,
        message.threadId,
      );
      result = await provider.unspam({ mailbox, messages });
    }
    if (result) {
      await this.mailMessageService.moveThreadToSpecialFolder(
        accountId,
        mailbox.id,
        message.threadId,
        MailboxFolderType.Inbox,
      );
      await this.mailboxFolderService.actualizeCounters({ accountId, mailboxId: mailbox.id });
    }
    return result;
  }

  async markSeenThread(accountId: number, userId: number, mailboxId: number, messageId: number) {
    const mailbox = await this.mailboxSettingsService.findOne({ accountId, mailboxId, accessibleUserId: userId });
    const message = await this.mailMessageService.getById(accountId, mailbox.id, messageId);
    const provider = this.mailProviderRegistry.get(mailbox.provider);
    let result = false;
    if (provider.isCapable('thread')) {
      result = await provider.setSeen({ mailbox, seen: true, messages: { threadId: message.threadId } });
    } else {
      const messages = await this.mailMessageService.getByThreadIdGroupByFolder(
        accountId,
        mailbox.id,
        message.threadId,
      );
      result = await provider.setSeen({ mailbox, seen: true, messages });
    }
    if (result) {
      await this.mailMessageService.markSeenThread(accountId, mailbox.id, message.threadId, true);
      await this.mailboxFolderService.actualizeCounters({ accountId, mailboxId: mailbox.id });
    }
    return result;
  }

  async markUnseenThread(accountId: number, userId: number, mailboxId: number, messageId: number) {
    const mailbox = await this.mailboxSettingsService.findOne({ accountId, mailboxId, accessibleUserId: userId });
    const message = await this.mailMessageService.getById(accountId, mailbox.id, messageId);
    const provider = this.mailProviderRegistry.get(mailbox.provider);
    let result = false;
    if (provider.isCapable('thread')) {
      result = await provider.setSeen({ mailbox, seen: false, messages: { threadId: message.threadId } });
    } else {
      const messages = await this.mailMessageService.getByThreadIdGroupByFolder(
        accountId,
        mailbox.id,
        message.threadId,
      );
      result = await provider.setSeen({ mailbox, seen: false, messages });
    }
    if (result) {
      await this.mailMessageService.markSeenThread(accountId, mailbox.id, message.threadId, true);
      await this.mailboxFolderService.actualizeCounters({ accountId, mailboxId: mailbox.id });
    }
    return result;
  }
}
