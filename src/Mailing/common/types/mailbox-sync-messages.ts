import { MailMessageExternal } from './mail-message-external';

export interface MailboxSyncMessages {
  added?: MailMessageExternal[] | null;
  updated?: MailMessageExternal[] | null;
  deleted?: string[] | null;
}
