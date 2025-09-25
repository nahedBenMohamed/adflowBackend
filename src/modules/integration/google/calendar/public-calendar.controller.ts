import { Controller, Get, Headers, Post, Query, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { CalendarService } from './calendar.service';

@ApiExcludeController()
@Controller('integration/google/calendar')
export class PublicCalendarController {
  constructor(private readonly service: CalendarService) {}

  @Get('callback')
  @Redirect()
  public async callback(@Query('code') code: string, @Query('state') state?: string) {
    const redirectUrl = await this.service.getRedirectUrl({ state, code });

    return { url: redirectUrl, statusCode: 302 };
  }

  @Post('webhook-calendars')
  public async webhookCalendars(
    @Headers('X-Goog-Channel-ID') channelId: string,
    @Headers('X-Goog-Resource-ID') resourceId: string,
    @Headers('X-Goog-Resource-State') resourceState: string,
  ) {
    this.service.processWebhookCalendars({ channelId, resourceId, resourceState });
  }

  @Post('webhook-events')
  public async webhookEvents(
    @Headers('X-Goog-Channel-ID') channelId: string,
    @Headers('X-Goog-Resource-ID') resourceId: string,
    @Headers('X-Goog-Resource-State') resourceState: string,
  ) {
    this.service.processWebhookEvents({ channelId, resourceId, resourceState });
  }
}
