import { StorageFile } from '@/modules/storage/types';

import {
  FolderMessages,
  MailboxSyncResult,
  MailMessageAttachment,
  MailMessageExternal,
  SendMailMessageDto,
} from '../../common';
import { Mailbox } from '../../mailbox';
import { MailMessagePayload } from '../../mail-message-payload';
import { MailMessage } from '../../Model/MailMessage/MailMessage';

export type MailProviderCapability = 'thread';

type ActionMessageId = { threadId: string } | FolderMessages[];

export interface MailProvider {
  isCapable(capability: MailProviderCapability): boolean;

  sync(params: { mailbox: Mailbox; syncFull?: boolean; syncDate?: Date }): Promise<MailboxSyncResult>;

  getAttachment(params: {
    mailbox: Mailbox;
    message: MailMessage;
    payload: MailMessagePayload;
  }): Promise<MailMessageAttachment | null>;

  send(params: {
    accountId: number;
    mailbox: Mailbox;
    userName: string;
    dto: SendMailMessageDto;
    replyToMessage?: MailMessage | null;
    attachments: StorageFile[];
  }): Promise<MailMessageExternal | null>;

  setSeen(params: { mailbox: Mailbox; seen: boolean; messages: ActionMessageId }): Promise<boolean>;

  trash(params: { mailbox: Mailbox; messages: ActionMessageId }): Promise<boolean>;
  untrash(params: { mailbox: Mailbox; messages: ActionMessageId }): Promise<boolean>;

  spam(params: { mailbox: Mailbox; messages: ActionMessageId }): Promise<boolean>;
  unspam(params: { mailbox: Mailbox; messages: ActionMessageId }): Promise<boolean>;
}
