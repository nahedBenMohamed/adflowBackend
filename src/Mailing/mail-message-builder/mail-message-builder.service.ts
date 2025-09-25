import { Injectable } from '@nestjs/common';
import Mail, { TextEncoding } from 'nodemailer/lib/mailer';
import MailComposer from 'nodemailer/lib/mail-composer';

import { StorageFile } from '@/modules/storage/types/storage-file';

import { SendMailMessageDto } from '../common';
import { MailMessage } from '../Model/MailMessage/MailMessage';

export const HEADER_ENTITY_ID = 'x-amwork-entityid';

@Injectable()
export class MailMessageBuilderService {
  async createNodemailerMessage(
    fromEmail: string,
    fromName: string,
    dto: SendMailMessageDto,
    replyToMessage: MailMessage | null,
    files: StorageFile[] | null,
  ): Promise<Mail.Options> {
    const attachments = files
      ? files.map((file) => {
          return {
            filename: file.originalName,
            encoding: file.encoding,
            contentType: file.mimeType,
            content: file.buffer,
          };
        })
      : undefined;
    const references = replyToMessage?.referencesTo ? replyToMessage.referencesTo : [];
    if (replyToMessage?.messageId) {
      references.push(replyToMessage.messageId);
    }
    const headers = dto.entityId ? [{ key: HEADER_ENTITY_ID, value: dto.entityId.toString() }] : undefined;
    const options = {
      from: { name: fromName, address: fromEmail },
      to: dto.sentTo.join(','),
      cc: dto.cc?.join(','),
      bcc: dto.bcc?.join(','),
      replyTo: dto.replyTo,
      inReplyTo: replyToMessage?.messageId,
      references: references && references.length > 0 ? references : undefined,
      subject: dto.subject,
      text: dto.contentText,
      html: dto.contentHtml,
      textEncoding: 'base64' as TextEncoding,
      headers: headers,
      attachments,
    };
    return options;
  }

  async createRawMessage(options: Mail.Options, encoding: BufferEncoding = 'base64url') {
    const mail = new MailComposer(options).compile();
    mail['keepBcc'] = true;
    return (await mail.build()).toString(encoding);
  }
}
