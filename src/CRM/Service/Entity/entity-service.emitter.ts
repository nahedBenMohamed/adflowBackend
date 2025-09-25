import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { UserNotification } from '@/common';

import { AutomationEventType, ProcessStartEvent, SendMessageEvent } from '@/modules/automation';
import { FieldValueService } from '@/modules/entity/entity-field/field-value';
import { FieldType } from '@/modules/entity/entity-field/common';

import { CrmEventType, EntityCreatedEvent, EntityEvent, EntityOwnerChangedEvent } from '../../common';
import { Entity } from '../../Model/Entity/Entity';

@Injectable()
export class EntityServiceEmitter {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly fieldValueService: FieldValueService,
  ) {}

  public async emitCreatedEvent(
    accountId: number,
    entity: Entity,
    options?: {
      copiedFrom?: number;
      userNotification?: UserNotification;
    },
  ) {
    this.eventEmitter.emit(
      CrmEventType.EntityCreated,
      new EntityCreatedEvent({
        accountId,
        entityId: entity.id,
        entityName: entity.name,
        boardId: entity.boardId,
        stageId: entity.stageId,
        createdBy: entity.createdBy,
        ownerId: entity.responsibleUserId,
        entityTypeId: entity.entityTypeId,
        copiedFrom: options?.copiedFrom,
        userNotification: options?.userNotification ?? UserNotification.Default,
      }),
    );

    if (!options?.copiedFrom) {
      this.sendAutomationMessage(accountId, entity, CrmEventType.EntityCreated);
    }
  }

  public async emitUpdatedEvent(
    accountId: number,
    entity: Entity,
    options?: {
      userNotification?: UserNotification;
    },
  ) {
    this.eventEmitter.emit(
      CrmEventType.EntityUpdated,
      new EntityEvent({
        accountId,
        entityId: entity.id,
        entityTypeId: entity.entityTypeId,
        boardId: entity.boardId,
        stageId: entity.stageId,
        ownerId: entity.responsibleUserId,
        userNotification: options?.userNotification,
      }),
    );
  }

  public async emitStageChangedEvent(
    accountId: number,
    entity: Entity,
    options?: {
      userNotification?: UserNotification;
    },
  ) {
    this.eventEmitter.emit(
      CrmEventType.EntityStageChanged,
      new EntityEvent({
        accountId,
        entityId: entity.id,
        entityTypeId: entity.entityTypeId,
        boardId: entity.boardId,
        stageId: entity.stageId,
        ownerId: entity.responsibleUserId,
        userNotification: options?.userNotification,
      }),
    );

    this.sendAutomationMessage(accountId, entity, CrmEventType.EntityStageChanged);
  }

  public async emitOwnerChangedEvent(
    accountId: number,
    changedBy: number,
    entity: Entity,
    options?: {
      copiedFrom?: number;
      userNotification?: UserNotification;
    },
  ) {
    this.eventEmitter.emit(
      CrmEventType.EntityOwnerChanged,
      new EntityOwnerChangedEvent({
        accountId,
        entityId: entity.id,
        entityName: entity.name,
        boardId: entity.boardId,
        stageId: entity.stageId,
        changedBy,
        ownerId: entity.responsibleUserId,
        entityTypeId: entity.entityTypeId,
        userNotification: options?.userNotification,
      }),
    );

    this.sendAutomationMessage(accountId, entity, CrmEventType.EntityOwnerChanged);
  }

  public async emitDeletedEvent(
    accountId: number,
    entity: Entity,
    options?: {
      userNotification?: UserNotification;
    },
  ) {
    this.eventEmitter.emit(
      CrmEventType.EntityDeleted,
      new EntityEvent({
        accountId,
        entityId: entity.id,
        entityTypeId: entity.entityTypeId,
        boardId: entity.boardId,
        stageId: entity.stageId,
        ownerId: entity.responsibleUserId,
        userNotification: options?.userNotification,
      }),
    );
  }

  private async sendAutomationMessage(accountId: number, entity: Entity, eventType: CrmEventType) {
    const entityVar = await this.createEntityVariable({ accountId, entity });

    this.eventEmitter.emit(
      AutomationEventType.SendMessage,
      new SendMessageEvent({
        accountId,
        message: {
          name: [accountId, entity.entityTypeId, eventType],
          variables: { accountId, entity: entityVar },
        },
      }),
    );
  }

  public async emitProcessStart({
    accountId,
    entity,
    processId,
  }: {
    accountId: number;
    entity: Entity;
    processId: number;
  }) {
    const entityVar = await this.createEntityVariable({ accountId, entity });

    this.eventEmitter.emit(
      AutomationEventType.ProcessStart,
      new ProcessStartEvent({ accountId, processId, variables: { accountId, entity: entityVar } }),
    );
  }

  public async createEntityVariable({ accountId, entity }: { accountId: number; entity: Entity }) {
    const fields = await this.getFieldValues({ accountId, entity });

    return {
      id: entity.id,
      name: entity.name,
      entityTypeId: entity.entityTypeId,
      responsibleUserId: entity.responsibleUserId,
      boardId: entity.boardId,
      stageId: entity.stageId,
      createdBy: entity.createdBy,
      participantIds: entity.participantIds,
      copiedFrom: entity.copiedFrom,
      copiedCount: entity.copiedCount,
      closedAt: entity.closedAt?.toISOString(),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      fields,
    };
  }

  private async getFieldValues({
    accountId,
    entity,
  }: {
    accountId: number;
    entity: Entity;
  }): Promise<Record<string, any>> {
    const fields = {};
    const fieldValues = await this.fieldValueService.findMany({ accountId, entityId: entity.id });
    fieldValues.forEach((fieldValue) => {
      let value = fieldValue.getValue();
      if (value !== null && value !== undefined) {
        switch (fieldValue.fieldType) {
          case FieldType.Email:
          case FieldType.Phone:
          case FieldType.MultiText:
            value = value
              ? Array.isArray(value)
                ? value
                    .filter((v) => v)
                    .map((v) => encodeURIComponent(v.toString()))
                    .join('\n')
                : encodeURIComponent(value.toString())
              : null;
            break;
          case FieldType.Select:
          case FieldType.ColoredSelect:
            value = value ? [value] : null;
            break;
          case FieldType.Link:
          case FieldType.Text:
          case FieldType.RichText:
            value = value ? encodeURIComponent(value.toString()) : null;
            break;
          case FieldType.Checklist:
            value = null; //skip checklist fields
        }
        if (value !== null && value !== undefined) {
          fields[`f_${fieldValue.fieldId}`] = value;
        }
      }
    });
    return fields;
  }
}
