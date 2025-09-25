import { Body, Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { BadRequestError } from '@/common';
import { MessengerProviderService } from '../messenger-provider.service';

@ApiExcludeController(true)
@Controller('chat/messenger')
export class PublicMessengerProviderController {
  constructor(private readonly service: MessengerProviderService) {}

  @Redirect()
  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Query('error') error?: string) {
    const redirectUrl = await this.service.authCallback(code, state, error);

    return { url: redirectUrl, statusCode: 302 };
  }

  @Get('webhook')
  async verifyWebhook(
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ): Promise<string> {
    return this.service.verifyWebhook(verifyToken, challenge);
  }

  @Post('webhook')
  async handleMessage(@Body() body: unknown): Promise<void> {
    await this.service.handleWebhook(body);
  }

  @Post('deauthorise')
  async deauthoriseUser(@Body('signed_request') signedRequest: string): Promise<void> {
    const result = await this.service.handleDeauthoriseRequest(signedRequest);
    if (!result) {
      throw new BadRequestError('Invalid signed request');
    }
  }

  @Post('delete')
  async deleteUser(@Body('signed_request') signedRequest: string) {
    return this.service.handleDeleteAuthRequest(signedRequest);
  }
}
