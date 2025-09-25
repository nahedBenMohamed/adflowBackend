import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { IamEventType, UserDeletedEvent } from '@/modules/iam/common';
import { BoardEvent, BoardStageDeletedEvent, CrmEventType, EntityTypeEvent } from '@/CRM/common';
import { FieldEvent, FieldEventType } from '@/modules/entity/entity-field/common';
import { ChatProviderEvent, ChatProviderStatus, MultichatEventType } from '@/modules/multichat/common';
import { MailboxEvent, MailEventType } from '@/Mailing/common';

import { AutomationEntityTypeService } from './automation-entity-type.service';
import { EntityTypeActionType } from './enums';

@Injectable()
export class AutomationEntityTypeHandler {
  constructor(private readonly service: AutomationEntityTypeService) {}

  @OnEvent(IamEventType.UserDeleted, { async: true })
  public async onUserDeleted(event: UserDeletedEvent) {
    if (event.newUserId) {
      await this.service.changeOwner({
        accountId: event.accountId,
        currentUserId: event.userId,
        newUserId: event.newUserId,
      });

      await this.service.updateByActionsCriteria({
        accountId: event.accountId,
        type: EntityTypeActionType.EntityResponsibleChange,
        criteria: { responsibleUserId: event.userId },
        payload: { newResponsibleUserId: event.newUserId },
      });
    } else {
      await this.service.deleteMany({ accountId: event.accountId, createdBy: event.userId });

      await this.service.deleteByActionsCriteria({
        accountId: event.accountId,
        type: EntityTypeActionType.EntityResponsibleChange,
        criteria: { responsibleUserId: event.userId },
      });
    }
  }

  @OnEvent(CrmEventType.EntityTypeDeleted, { async: true })
  public async onEntityTypeDeleted(event: EntityTypeEvent) {
    await this.service.deleteMany({ accountId: event.accountId, entityTypeId: event.entityTypeId });
    await this.service.deleteByActionsCriteria({
      accountId: event.accountId,
      type: EntityTypeActionType.EntityCreate,
      criteria: { entityTypeId: event.entityTypeId },
    });
    await this.service.deleteByActionsCriteria({
      accountId: event.accountId,
      type: EntityTypeActionType.EntityLinkedStageChange,
      criteria: { entityTypeId: event.entityTypeId },
    });
  }

  // !!!
  @OnEvent(CrmEventType.BoardDeleted, { async: true })
  public async onBoardDeleted(event: BoardEvent) {
    await this.service.deleteMany({ accountId: event.accountId, boardId: event.boardId });
    await this.service.deleteByActionsCriteria({
      accountId: event.accountId,
      type: EntityTypeActionType.EntityCreate,
      criteria: { boardId: event.boardId },
    });
  }

  @OnEvent(CrmEventType.BoardStageDeleted, { async: true })
  public async onBoardStageDeleted(event: BoardStageDeletedEvent) {
    await this.service.deleteMany({ accountId: event.accountId, boardId: event.boardId, stageId: event.stageId });
    await this.service.deleteByActionsCriteria({
      accountId: event.accountId,
      type: EntityTypeActionType.EntityCreate,
      criteria: { stageId: event.stageId },
    });
    await this.service.deleteByActionsCriteria({
      accountId: event.accountId,
      type: EntityTypeActionType.EntityStageChange,
      criteria: { stageId: event.stageId },
    });
    await this.service.deleteByActionsCriteria({
      accountId: event.accountId,
      type: EntityTypeActionType.EntityLinkedStageChange,
      criteria: { stageId: event.stageId },
    });
  }

  @OnEvent(FieldEventType.FieldDeleted, { async: true })
  public async onFieldDeleted(event: FieldEvent) {
    await this.service.deleteByConditionsCriteria({
      accountId: event.accountId,
      criteria: { fieldId: event.fieldId },
    });
  }

  @OnEvent(MailEventType.MailboxDeleted, { async: true })
  public async onMailboxDeleted(event: MailboxEvent) {
    await this.service.deleteByActionsCriteria({
      accountId: event.accountId,
      type: EntityTypeActionType.EmailSend,
      criteria: { mailboxId: event.mailboxId },
    });
  }

  @OnEvent(MultichatEventType.ChatProviderUpdated, { async: true })
  public async onChatProviderUpdated(event: ChatProviderEvent) {
    if (event.status !== ChatProviderStatus.Active) {
      await this.service.deleteByActionsCriteria({
        accountId: event.accountId,
        type: EntityTypeActionType.ChatSendExternal,
        criteria: { providerId: event.providerId },
      });
    }
  }

  @OnEvent(MultichatEventType.ChatProviderDeleted, { async: true })
  public async onChatProviderDeleted(event: ChatProviderEvent) {
    await this.service.deleteByActionsCriteria({
      accountId: event.accountId,
      type: EntityTypeActionType.ChatSendExternal,
      criteria: { providerId: event.providerId },
    });
  }
}
