import { EmailAddress } from './email-address';
import { MailMessagePayloadExternal } from './mail-message-payload-external';

export interface MailMessageExternal {
  id: string;
  threadId: string | null;
  snippet: string | null;
  sentFrom: EmailAddress | null;
  sentTo: EmailAddress | null;
  replyTo: EmailAddress | null;
  cc: EmailAddress | null;
  subject: string | null;
  date: Date;
  hasAttachment: boolean;
  messageId: string | null;
  inReplyTo: string | null;
  references: string[] | null;
  isSeen: boolean;
  entityId: number | null;
  folders: string[];
  payloads: MailMessagePayloadExternal[];
}
