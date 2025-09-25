import { Body, Controller, Param, ParseIntPipe, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { StorageFile } from '@/modules/storage/types/storage-file';

import { SendMailMessageDto } from '../../common';
import { MailboxService } from '../../Service/Mailbox/MailboxService';

@ApiTags('mailing/messages')
@Controller()
@JwtAuthorized()
export class SendMailMessageController {
  constructor(private mailboxService: MailboxService) {}

  @Post('/mailing/mailboxes/:mailboxId/send')
  @UseInterceptors(FilesInterceptor('attachment', 100, { storage: memoryStorage() }))
  async sendMessage(
    @CurrentAuth() { accountId, userId }: AuthData,
    @Param('mailboxId', ParseIntPipe) mailboxId: number,
    @Body('message') message: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<boolean> {
    const dto = JSON.parse(message) as SendMailMessageDto;
    const attachments = files ? files.map((file) => StorageFile.fromMulter(file)) : [];
    return await this.mailboxService.sendMessage(accountId, userId, mailboxId, dto, attachments);
  }
}
