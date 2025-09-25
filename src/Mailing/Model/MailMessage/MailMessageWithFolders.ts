import { MailboxFolder } from '../../mailbox-folder';
import { type MailMessage } from './MailMessage';

export class MailMessageWithFolders {
  message: MailMessage;
  folders: MailboxFolder[];

  constructor(message: MailMessage, folders: MailboxFolder[]) {
    this.message = message;
    this.folders = folders;
  }
}
