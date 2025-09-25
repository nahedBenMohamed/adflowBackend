import { ApiProperty } from '@nestjs/swagger';

import { PagingMeta } from '@/common';
import { NotificationDto } from './notification.dto';

export class NotificationsResult {
  @ApiProperty()
  meta: PagingMeta;

  @ApiProperty()
  notifications: NotificationDto[];

  constructor(notifications: NotificationDto[], meta: PagingMeta) {
    this.notifications = notifications;
    this.meta = meta;
  }
}
