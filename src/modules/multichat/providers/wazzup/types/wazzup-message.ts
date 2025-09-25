import { type WazzupChatType, type WazzupMessageStatus, type WazzupMessageType } from '../enums';
import { type WazzupMessageContact } from './wazzup-message-contact';
import { type WazzupMessageError } from './wazzup-message-error';

export class WazzupMessage {
  messageId: string;
  channelId: string;
  chatType: WazzupChatType;
  chatId: string;
  dateTime: string;
  type: WazzupMessageType;
  status: WazzupMessageStatus;
  error: WazzupMessageError;
  text: string;
  contentUri: string;
  authorName: string;
  isEcho: boolean;
  contact: WazzupMessageContact;
  avitoProfileId?: string;
}
