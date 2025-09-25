import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';

import { WazzupProviderService } from '../wazzup-provider.service';

@ApiExcludeController(true)
@Controller('chat/wazzup')
export class PublicWazzupProviderController {
  constructor(private readonly service: WazzupProviderService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: unknown, @Res() res: Response) {
    const response = await this.service.handleWebhook(body);

    res.type('text/json').status(200).send(response);
  }
}
