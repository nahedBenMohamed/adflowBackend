import { MailboxFolderExternal } from './mailbox-folder-external';
import { MailboxSyncMessages } from './mailbox-sync-messages';

export interface MailboxSyncResult {
  result: boolean;
  message?: string | null;
  folders?: MailboxFolderExternal[] | null;
  messages?: MailboxSyncMessages | null;
}
