import { MailboxFolderType } from '../enums';

export interface MailboxFolderExternal {
  id: string;
  uidValidity?: number | null;
  uidNext?: number | null;
  name: string;
  type?: MailboxFolderType | null;
  folders?: MailboxFolderExternal[] | null;
}
