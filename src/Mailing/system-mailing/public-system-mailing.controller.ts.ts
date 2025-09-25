import { Body, Controller, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { ApiAccessRequired } from '@/modules/iam/common';

import { SendFeedbackDto } from './dto';
import { SystemMailingService } from './system-mailing.service';

@ApiExcludeController(true)
@Controller('mailing/feedback/public')
@ApiAccessRequired()
export class PublicSystemMailingController {
  constructor(private readonly service: SystemMailingService) {}

  @Post()
  async sendFeedback(@Body() dto: SendFeedbackDto) {
    await this.service.sendFeedback(null, null, dto);
  }
}
