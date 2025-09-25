import { Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { PagingQuery } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { AuthDataPrefetch } from '@/modules/iam/common/decorators/auth-data-prefetch.decorator';

import { NotificationsResult } from './dto';
import { NotificationService } from './notification.service';

@ApiTags('notification')
@Controller('/notifications')
@JwtAuthorized()
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @AuthDataPrefetch({ user: true })
  @ApiCreatedResponse({ description: 'Notifications for user', type: NotificationsResult })
  @Get()
  public async getNotifications(
    @CurrentAuth() { accountId, user }: AuthData,
    @Query() paging: PagingQuery,
  ): Promise<NotificationsResult> {
    return this.service.getNotifications(accountId, user, paging);
  }

  @ApiCreatedResponse({ description: 'Unread notifications count', type: Number })
  @Get('/unseen-count')
  public async getUnseenCount(@CurrentAuth() { accountId, userId }: AuthData): Promise<number> {
    return this.service.getUnseenCount(accountId, userId);
  }

  @Put('/:id/seen')
  public async markSeenNotification(@CurrentAuth() { accountId, userId }: AuthData, @Param('id') id: number) {
    return await this.service.markSeenNotification(accountId, userId, id);
  }

  @Put('/seen')
  public async markSeenAllNotifications(@CurrentAuth() { accountId, userId }: AuthData) {
    return await this.service.markSeenAllNotifications(accountId, userId);
  }
}
