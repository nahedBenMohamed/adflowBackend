import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { SendFeedbackDto } from './dto';
import { SystemMailingService } from './system-mailing.service';

@ApiTags('mailing/feedback')
@Controller('mailing')
@JwtAuthorized({ prefetch: { account: true, user: true } })
export class SystemMailingController {
  constructor(private readonly service: SystemMailingService) {}

  @Post('feedback')
  async sendFeedback(@CurrentAuth() { account, user }: AuthData, @Body() dto: SendFeedbackDto) {
    await this.service.sendFeedback(account, user, dto);
  }
}
