export interface MailMessageAttachment {
  mimeType: string;
  filename: string;
  content: Uint8Array | Buffer;
}
