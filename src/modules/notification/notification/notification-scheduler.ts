import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DateUtil } from '@/common';

import { ActivityService } from '@/CRM/activity/activity.service';
import { TaskService } from '@/CRM/task/task.service';

import { NotificationSettingsService } from '../notification-settings/notification-settings.service';

import { NotificationType } from './enums';
import { NotificationService } from './notification.service';

const PROCESS_LIMIT = 100;

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);
  constructor(
    private notificationService: NotificationService,
    private taskService: TaskService,
    private activityService: ActivityService,
    private notificationSettingsService: NotificationSettingsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async notifyTaskOverdue() {
    if (process.env.SCHEDULE_NOTIFICATION_TASK_OVERDUE_DISABLE === 'true') return;
    this.logger.log('Before: Running task overdue notifications');
    const to = DateUtil.now();
    const from = DateUtil.sub(to, { minutes: 1 });

    const notifications = await this.taskService.getOverdueNotifications(from, to);
    if (notifications && notifications.length > 0) {
      notifications.forEach((notification) => this.notificationService.create(notification));
    }
    this.logger.log(`After: Running task overdue notifications. Processed: ${notifications.length}`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async notifyTaskBeforeStart() {
    if (process.env.SCHEDULE_NOTIFICATION_TASK_BEFORE_START_DISABLE === 'true') return;
    this.logger.log('Before: Running task before start notifications');
    const to = DateUtil.now();
    const from = DateUtil.sub(to, { minutes: 1 });
    let offset = 0;
    let processed = false;
    do {
      const result = await this.notificationSettingsService.getNotificationSettingsWithBefore(
        NotificationType.TASK_BEFORE_START,
        offset,
        PROCESS_LIMIT,
      );
      result.forEach(async ({ userId, before }) => {
        const currentFrom = DateUtil.add(from, { seconds: before });
        const currentTo = DateUtil.add(to, { seconds: before });
        const notifications = await this.taskService.getBeforeStartNotifications(userId, currentFrom, currentTo);
        if (notifications && notifications.length > 0) {
          notifications.forEach((notification) => {
            notification.setStartsIn(before);
            this.notificationService.create(notification);
          });
        }
      });
      offset += result.length;
      processed = result.length >= PROCESS_LIMIT;
    } while (processed);
    this.logger.log(`After: Running task before start notifications. Processed: ${offset}`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async notifyTaskOverdueFollow() {
    if (process.env.SCHEDULE_NOTIFICATION_TASK_OVERDUE_FOLLOW_DISABLE === 'true') return;
    this.logger.log('Before: Running task overdue follow notifications');
    const to = DateUtil.now();
    const from = DateUtil.sub(to, { minutes: 1 });
    let offset = 0;
    let processed = false;
    do {
      const result = await this.notificationSettingsService.getNotificationSettingsWithFollow(
        NotificationType.TASK_OVERDUE_EMPLOYEE,
        offset,
        PROCESS_LIMIT,
      );
      result.forEach(async ({ userId, followUserIds }) => {
        const notifications = await this.taskService.getOverdueForFollowNotifications(userId, from, to, followUserIds);
        if (notifications && notifications.length > 0) {
          notifications.forEach((notification) => this.notificationService.create(notification));
        }
      });
      offset += result.length;
      processed = result.length >= PROCESS_LIMIT;
    } while (processed);
    this.logger.log(`After: Running task overdue follow notifications. Processed: ${offset}`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async notifyActivityOverdue() {
    if (process.env.SCHEDULE_NOTIFICATION_ACTIVITY_OVERDUE_DISABLE === 'true') return;
    this.logger.log('Before: Running activity overdue notifications');
    const to = DateUtil.now();
    const from = DateUtil.sub(to, { minutes: 1 });

    const notifications = await this.activityService.getOverdueNotifications(from, to);
    if (notifications && notifications.length > 0) {
      notifications.forEach((notification) => this.notificationService.create(notification));
    }
    this.logger.log(`After: Running activity overdue notifications. Processed: ${notifications.length}`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async notifyActivityBeforeStart() {
    if (process.env.SCHEDULE_NOTIFICATION_ACTIVITY_BEFORE_START_DISABLE === 'true') return;
    this.logger.log('Before: Running activity before start notifications');
    const to = DateUtil.now();
    const from = DateUtil.sub(to, { minutes: 1 });
    let offset = 0;
    let processed = false;
    do {
      const result = await this.notificationSettingsService.getNotificationSettingsWithBefore(
        NotificationType.ACTIVITY_BEFORE_START,
        offset,
        PROCESS_LIMIT,
      );
      result.forEach(async ({ userId, before }) => {
        const currentFrom = DateUtil.add(from, { seconds: before });
        const currentTo = DateUtil.add(to, { seconds: before });
        const notifications = await this.activityService.getBeforeStartNotifications(userId, currentFrom, currentTo);
        if (notifications && notifications.length > 0) {
          notifications.forEach((notification) => {
            notification.setStartsIn(before);
            this.notificationService.create(notification);
          });
        }
      });
      offset += result.length;
      processed = result.length >= PROCESS_LIMIT;
    } while (processed);
    this.logger.log(`After: Running activity before start notifications. Processed: ${offset}`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async notifyActivityOverdueFollow() {
    if (process.env.SCHEDULE_NOTIFICATION_ACTIVITY_OVERDUE_FOLLOW_DISABLE === 'true') return;
    this.logger.log('Before: Running activity overdue follow notifications');
    const to = DateUtil.now();
    const from = DateUtil.sub(to, { minutes: 1 });
    let offset = 0;
    let processed = false;
    do {
      const result = await this.notificationSettingsService.getNotificationSettingsWithFollow(
        NotificationType.ACTIVITY_OVERDUE_EMPLOYEE,
        offset,
        PROCESS_LIMIT,
      );
      result.forEach(async ({ userId, followUserIds }) => {
        const notifications = await this.activityService.getOverdueForFollowNotifications(
          userId,
          from,
          to,
          followUserIds,
        );
        if (notifications && notifications.length > 0) {
          notifications.forEach((notification) => this.notificationService.create(notification));
        }
      });
      offset += result.length;
      processed = result.length >= PROCESS_LIMIT;
    } while (processed);
    this.logger.log(`After: Running activity overdue follow notifications. Processed: ${offset}`);
  }
}
