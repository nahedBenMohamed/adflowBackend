import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';

import { TwilioProviderService } from '../twilio-provider.service';

@ApiExcludeController(true)
@Controller('chat/twilio')
export class PublicTwilioProviderController {
  constructor(private readonly service: TwilioProviderService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: unknown, @Res() res: Response) {
    const response = await this.service.handleWebhook(body);

    res.type('text/xml').send(response);
  }
}
