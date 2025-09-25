import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { convert } from 'html-to-text';

import { UserNotification } from '@/common';
import {
  ActivityCreatedEvent,
  CrmEventType,
  EntityCreatedEvent,
  EntityImportEvent,
  EntityOwnerChangedEvent,
  NoteCreatedEvent,
  TaskCommentCreatedEvent,
  TaskCreatedEvent,
} from '@/CRM/common';
import { MailEventType, MailMessageReceivedEvent } from '@/Mailing/common';

import { CreateNotificationDto } from './dto';
import { NotificationType } from './enums';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationEventHandler {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(CrmEventType.ActivityCreated, { async: true })
  public async onActivityCreated(event: ActivityCreatedEvent) {
    if (event.createdBy !== event.ownerId) {
      await this.notificationService.create(
        new CreateNotificationDto(
          event.accountId,
          event.ownerId,
          NotificationType.ACTIVITY_NEW,
          event.activityId,
          event.entityId,
          event.createdBy,
          null,
          convert(event.activityText),
        ),
      );
    }
  }

  @OnEvent(CrmEventType.TaskCreated, { async: true })
  public async onTaskCreated(event: TaskCreatedEvent) {
    if (event.createdBy !== event.ownerId) {
      await this.notificationService.create(
        new CreateNotificationDto(
          event.accountId,
          event.ownerId,
          NotificationType.TASK_NEW,
          event.taskId,
          event.entityId,
          event.createdBy,
          event.taskTitle,
          convert(event.taskText),
        ),
      );
    }
  }

  @OnEvent(CrmEventType.TaskCommentCreated, { async: true })
  public async onTaskCommentCreated(event: TaskCommentCreatedEvent) {
    if (event.createdBy !== event.ownerId) {
      await this.notificationService.create(
        new CreateNotificationDto(
          event.accountId,
          event.ownerId,
          NotificationType.TASK_COMMENT_NEW,
          event.taskId,
          event.entityId,
          event.createdBy,
          event.taskTitle,
          convert(event.taskComment),
        ),
      );
    }
  }

  @OnEvent(CrmEventType.EntityCreated, { async: true })
  public async onEntityCreated(event: EntityCreatedEvent) {
    if (event.userNotification === UserNotification.Suppressed) {
      return;
    }
    if (event.userNotification === UserNotification.Forced || event.createdBy !== event.ownerId) {
      await this.notificationService.create(
        new CreateNotificationDto(
          event.accountId,
          event.ownerId,
          NotificationType.ENTITY_NEW,
          event.entityTypeId,
          event.entityId,
          event.createdBy,
          event.entityName,
          null,
        ),
      );
    }
  }

  @OnEvent(CrmEventType.EntityOwnerChanged, { async: true })
  public async onEntityOwnerChanged(event: EntityOwnerChangedEvent) {
    if (event.changedBy !== event.ownerId) {
      await this.notificationService.create(
        new CreateNotificationDto(
          event.accountId,
          event.ownerId,
          NotificationType.ENTITY_RESPONSIBLE_CHANGE,
          event.entityTypeId,
          event.entityId,
          event.changedBy,
          event.entityName,
          null,
        ),
      );
    }
  }

  @OnEvent(CrmEventType.EntityImportCompleted, { async: true })
  public async onEntityImportCompleted(event: EntityImportEvent) {
    await this.notificationService.create(
      new CreateNotificationDto(
        event.accountId,
        event.userId,
        NotificationType.ENTITY_IMPORT_COMPLETED,
        event.entityTypeId,
        null,
        event.userId,
        null,
        `Import of '${event.fileName}' is completed. Created ${event.totalCount} ${event.entityTypeName}.`,
      ),
    );
  }

  @OnEvent(CrmEventType.NoteCreated, { async: true })
  public async onEntityNoteCreated(event: NoteCreatedEvent) {
    if (event.createdBy !== event.ownerId) {
      await this.notificationService.create(
        new CreateNotificationDto(
          event.accountId,
          event.ownerId,
          NotificationType.ENTITY_NOTE_NEW,
          event.noteId,
          event.entityId,
          event.createdBy,
          event.entityName,
          convert(event.noteText),
        ),
      );
    }
  }

  @OnEvent(MailEventType.MailMessageReceived, { async: true })
  public async onMailMessageReceived(event: MailMessageReceivedEvent) {
    if (event.isInbox) {
      await this.notificationService.create(
        new CreateNotificationDto(
          event.accountId,
          event.ownerId,
          NotificationType.MAIL_MESSAGE_NEW,
          event.messageId,
          event.entityId,
          null,
          event.messageSubject,
          event.messageSnippet,
        ),
      );
    }
  }
}
