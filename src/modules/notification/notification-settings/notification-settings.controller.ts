import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsDto } from './dto/notification-settings.dto';

@ApiTags('notification')
@Controller('/notifications/settings')
@JwtAuthorized({ prefetch: { user: true } })
export class NotificationSettingsController {
  constructor(private readonly service: NotificationSettingsService) {}

  @ApiCreatedResponse({ description: 'Notification settings for user', type: NotificationSettingsDto })
  @Get()
  public async getSettings(@CurrentAuth() { accountId, user }: AuthData): Promise<NotificationSettingsDto> {
    return this.service.getSettings(accountId, user);
  }

  @ApiCreatedResponse({ description: 'Notification settings for user', type: NotificationSettingsDto })
  @Put()
  public async updateSettings(
    @CurrentAuth() { accountId, user }: AuthData,
    @Body() dto: NotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    return this.service.updateSettings(accountId, user, dto);
  }
}
