import { Body, Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { ApiExcludeController, ApiOkResponse } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AppsumoWebhookRequest, AppsumoWebhookResponse } from './types';
import { AppsumoService } from './appsumo.service';

@ApiExcludeController(true)
@Controller('integration/appsumo')
@TransformToDto()
export class AppsumoController {
  constructor(private readonly service: AppsumoService) {}

  @ApiOkResponse({ description: 'AppSumo login redirect' })
  @Get('redirect')
  @Redirect()
  public async redirect(@Query('code') code: string) {
    const redirectUrl = await this.service.redirect(code);

    return { url: redirectUrl, statusCode: 302 };
  }

  @ApiOkResponse({ description: 'AppSumo webhook', type: AppsumoWebhookResponse })
  @Post('webhook')
  public async getUser(@Body() dto: AppsumoWebhookRequest) {
    return this.service.webhook(dto);
  }
}
