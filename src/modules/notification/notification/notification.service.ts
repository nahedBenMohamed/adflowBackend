import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PagingQuery, PagingMeta } from '@/common';

import { UserService } from '@/modules/iam/user/user.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { EntityInfoService } from '@/modules/entity/entity-info/entity-info.service';

import { NotificationEventType, NotificationUnseenEvent } from '../common';

import { NotificationSettingsService } from '../notification-settings/notification-settings.service';

import { CreateNotificationDto, NotificationsResult, NotificationDto } from './dto';
import { Notification } from './entities';
import { NotificationType } from './enums';

@Injectable()
export class NotificationService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
    private readonly notificationSettingsService: NotificationSettingsService,
    private readonly entityInfoService: EntityInfoService,
    private readonly userService: UserService,
  ) {}

  public async create(dto: CreateNotificationDto) {
    const { isEnabled, enablePopup } = await this.notificationSettingsService.checkEnabled(
      dto.accountId,
      dto.userId,
      dto.type,
      dto.type === NotificationType.ENTITY_NEW ? dto.objectId : null,
    );

    if (isEnabled) {
      const notification = await this.repository.save(Notification.fromDto(dto));
      if (enablePopup) {
        const user = await this.userService.findOne({ accountId: dto.accountId, id: dto.userId });
        const event = await this.convertToDto(notification, user);
        this.eventEmitter.emit(NotificationEventType.NOTIFICATION_CREATED, event);
      }
    }

    const unseenCount = await this.getUnseenCount(dto.accountId, dto.userId);
    this.eventEmitter.emit(
      NotificationEventType.NOTIFICATION_UNSEEN,
      new NotificationUnseenEvent({ accountId: dto.accountId, userId: dto.userId, unseenCount }),
    );
  }

  public async getNotifications(accountId: number, user: User, paging: PagingQuery): Promise<NotificationsResult> {
    const [notifications, total] = await this.repository.findAndCount({
      where: { accountId, userId: user.id },
      take: paging.take,
      skip: paging.skip,
      order: { createdAt: 'DESC', id: 'DESC' },
    });

    const notificationDtos: NotificationDto[] = [];
    for (const notification of notifications) {
      notificationDtos.push(await this.convertToDto(notification, user));
    }

    return new NotificationsResult(notificationDtos, new PagingMeta(paging.skip + paging.take, total));
  }

  private async convertToDto(notification: Notification, user: User): Promise<NotificationDto> {
    const entityInfo = notification.entityId
      ? await this.entityInfoService.findOne({
          accountId: notification.accountId,
          user,
          entityId: notification.entityId,
        })
      : null;

    return notification.toDto(entityInfo);
  }

  public async getUnseenCount(accountId: number, userId: number): Promise<number> {
    return await this.repository.countBy({ accountId, userId, isSeen: false });
  }

  public async markSeenNotification(accountId: number, userId: number, id: number) {
    await this.repository.update({ accountId, userId, id }, { isSeen: true });
  }

  public async markSeenAllNotifications(accountId: number, userId: number) {
    await this.repository.update({ accountId, userId }, { isSeen: true });
  }
}
