import { Controller, Get, HttpStatus, Param, ParseIntPipe, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { MailMessageService } from '../../Service/MailMessage/MailMessageService';

@ApiTags('mailing/messages')
@Controller()
@JwtAuthorized()
export class GetAttachmentController {
  constructor(private mailMessageService: MailMessageService) {}

  @Get('/mailing/mailboxes/:mailboxId/messages/:messageId/attachments/:payloadId')
  @ApiOkResponse({ description: 'Get attachment for mail message', type: StreamableFile })
  async getAttachment(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Param('payloadId', ParseIntPipe) payloadId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | null> {
    const attachment = await this.mailMessageService.getMessageAttachment(
      accountId,
      userId,
      mailboxId,
      messageId,
      payloadId,
    );
    if (attachment) {
      res.set({
        'Content-Type': attachment.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURI(attachment.filename)}"`,
      });
      return new StreamableFile(attachment.content);
    } else {
      res.sendStatus(HttpStatus.NOT_FOUND);
      return null;
    }
  }
}
