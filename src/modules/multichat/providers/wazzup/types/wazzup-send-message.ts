export class WazzupSendMessage {
  channelId: string;
  chatType: string;
  chatId?: string;
  text?: string;
  contentUri?: string;
  refMessageId?: string;
  /** Only for Telegram, for direct message, without @ */
  username?: string;
  /** Only for Telegram for direct message, only numbers */
  phone?: string;

  constructor({ channelId, chatType, chatId, text, contentUri, refMessageId, username, phone }: WazzupSendMessage) {
    this.channelId = channelId;
    this.chatType = chatType;
    this.chatId = chatId;
    this.text = text;
    this.contentUri = contentUri;
    this.refMessageId = refMessageId;
    this.username = username;
    this.phone = phone;
  }
}
