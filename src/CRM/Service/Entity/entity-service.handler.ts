import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { IamEventType, UserDeletedEvent } from '@/modules/iam/common';
import { UserService } from '@/modules/iam/user/user.service';
import { FieldEvent, FieldEventType, FieldTypes } from '@/modules/entity/entity-field/common';
import {
  ActionEntityCreateSettings,
  ActionEntityStageChangeSettings,
  AutomationEventType,
  EntityTypeApplyEvent,
  OnAutomationJob,
  EntityTypeActionType,
  AutomationJob,
  ChangeStageType,
  ActionEntityResponsibleChangeSettings,
  ActionEntityLinkedStageChangeSettings,
} from '@/modules/automation';

import { CrmEventType, EntityPriceUpdateEvent } from '../../common';
import { Entity } from '../../Model/Entity/Entity';
import { EntityService } from './EntityService';
import { EntityServiceEmitter } from './entity-service.emitter';

interface EntityVariables {
  id?: number | null;
  stageId?: number | null;
  entityTypeId?: number | null;
  responsibleUserId?: number | null;
}

interface EntityCreateVariables {
  accountId: number;
  entity?: EntityVariables | null;
  entitySettings?: ActionEntityCreateSettings | null;
}

interface EntityChangeStageVariables {
  accountId: number;
  entity?: EntityVariables | null;
  entitySettings?: ActionEntityStageChangeSettings | null;
}

interface EntityLinkedChangeStageVariables {
  accountId: number;
  entity?: EntityVariables | null;
  entitySettings?: ActionEntityLinkedStageChangeSettings | null;
}

interface EntityResponsibleChangeVariables {
  accountId: number;
  entity?: EntityVariables | null;
  entitySettings?: ActionEntityResponsibleChangeSettings | null;
}

@Injectable()
export class EntityServiceHandler {
  private readonly logger = new Logger(EntityServiceHandler.name);
  constructor(
    private readonly userService: UserService,
    private readonly entityService: EntityService,
    private readonly entityEmitter: EntityServiceEmitter,
  ) {}

  @OnEvent(IamEventType.UserDeleted, { async: true })
  public async onUserDeleted(event: UserDeletedEvent) {
    await this.entityService.removeUser(event);
  }

  @OnEvent(CrmEventType.EntityPriceUpdate, { async: true })
  public async onEntityPriceUpdate(event: EntityPriceUpdateEvent) {
    this.entityService.updateValue(event.accountId, event.entityId, event.price);
  }

  @OnEvent(FieldEventType.FieldCreated, { async: true })
  public async onFieldCreated(event: FieldEvent) {
    if (FieldTypes.formula.includes(event.type)) {
      this.entityService.recalculateFormulas(event);
    }
  }

  @OnEvent(FieldEventType.FieldUpdated, { async: true })
  public async onFieldUpdated(event: FieldEvent) {
    if (FieldTypes.formula.includes(event.type)) {
      this.entityService.recalculateFormulas(event);
    }
  }

  @OnEvent(AutomationEventType.EntityTypeApply, { async: true })
  public async onAutomationApply(event: EntityTypeApplyEvent) {
    this.entityService.applyAutomation({
      accountId: event.accountId,
      processId: event.processId,
      entityTypeId: event.entityTypeId,
      stageId: event.stageId,
    });
  }

  /**
   * @deprecated use new @see handleStageChangeJob instead
   */
  @OnAutomationJob(EntityTypeActionType.ChangeStage)
  async handleStageChangeJobOld(job: AutomationJob<EntityChangeStageVariables>): Promise<{ variables?: unknown }> {
    return this.handleStageChangeJob(job);
  }
  @OnAutomationJob(EntityTypeActionType.EntityStageChange)
  async handleStageChangeJob(job: AutomationJob<EntityChangeStageVariables>): Promise<{ variables?: unknown }> {
    if (!job.variables?.accountId || !job.variables?.entity || !job.variables?.entitySettings) {
      this.logger.warn(`Automation job variables are not valid`, job.variables);
      return { variables: job.variables };
    }

    try {
      const { accountId, entity, entitySettings } = job.variables;

      const current = await this.entityService.findOne(accountId, { entityId: entity.id });
      if (current && (!current.stageId || entitySettings.allowAnyStage || current.stageId === entity.stageId)) {
        const user = await this.userService.findOne({ accountId, id: entity.responsibleUserId });
        let updated: Entity = null;
        switch (entitySettings.operationType) {
          case ChangeStageType.Move:
            updated = await this.entityService.update(accountId, user, entity.id, { stageId: entitySettings.stageId });
            break;
          case ChangeStageType.CopyOriginal:
            updated = await this.entityService.copyToStage(accountId, entity.id, entitySettings.stageId, true);
            break;
          case ChangeStageType.CopyNew:
            updated = await this.entityService.copyToStage(accountId, entity.id, entitySettings.stageId, false);
            break;
        }
        const updatedVar = updated
          ? await this.entityEmitter.createEntityVariable({ accountId, entity: updated })
          : null;
        return { variables: { ...job.variables, entity: updatedVar ?? entity } };
      }
    } catch (e) {
      this.logger.error(`Automation job error`, (e as Error)?.stack);
    }
    return { variables: job.variables };
  }

  @OnAutomationJob(EntityTypeActionType.EntityLinkedStageChange)
  async handleLinkedStageChangeJob(
    job: AutomationJob<EntityLinkedChangeStageVariables>,
  ): Promise<{ variables?: unknown }> {
    if (!job.variables?.accountId || !job.variables?.entity || !job.variables?.entitySettings) {
      this.logger.warn(`Automation job variables are not valid`, job.variables);
      return { variables: job.variables };
    }

    try {
      const { accountId, entity, entitySettings } = job.variables;

      const linkedEntities = await this.entityService.findLinkedEntities({
        accountId,
        entityId: entity.id,
        entityTypeId: entitySettings.entityTypeId,
      });
      if (linkedEntities.length) {
        const current = linkedEntities[0];
        const user = await this.userService.findOne({ accountId, id: current.responsibleUserId });
        let updated: Entity = null;
        switch (entitySettings.operationType) {
          case ChangeStageType.Move:
            updated = await this.entityService.update(accountId, user, current.id, {
              stageId: entitySettings.stageId,
            });
            break;
          case ChangeStageType.CopyOriginal:
            updated = await this.entityService.copyToStage(accountId, current.id, entitySettings.stageId, true);
            break;
          case ChangeStageType.CopyNew:
            updated = await this.entityService.copyToStage(accountId, current.id, entitySettings.stageId, false);
            break;
        }
        const updatedVar = updated
          ? await this.entityEmitter.createEntityVariable({ accountId, entity: updated })
          : null;
        return { variables: { ...job.variables, entity: updatedVar ?? entity } };
      }
    } catch (e) {
      this.logger.error(`Automation job error`, (e as Error)?.stack);
    }
    return { variables: job.variables };
  }

  @OnAutomationJob(EntityTypeActionType.EntityResponsibleChange)
  async handleResponsibleChangeJob(
    job: AutomationJob<EntityResponsibleChangeVariables>,
  ): Promise<{ variables?: unknown }> {
    if (!job.variables?.accountId || !job.variables?.entity || !job.variables?.entitySettings) {
      this.logger.warn(`Automation job variables are not valid`, job.variables);
      return { variables: job.variables };
    }

    try {
      const { accountId, entity, entitySettings } = job.variables;

      const current = await this.entityService.findOne(accountId, { entityId: entity.id });
      if (current && (!current.stageId || entitySettings.allowAnyStage || current.stageId === entity.stageId)) {
        const user = await this.userService.findOne({ accountId, id: entity.responsibleUserId });

        const updated = await this.entityService.update(accountId, user, entity.id, {
          responsibleUserId: entitySettings.responsibleUserId,
        });

        const updatedVar = await this.entityEmitter.createEntityVariable({ accountId, entity: updated });
        return { variables: { ...job.variables, entity: updatedVar } };
      }
    } catch (e) {
      this.logger.error(`Automation job error`, (e as Error)?.stack);
    }

    return { variables: job.variables };
  }

  @OnAutomationJob(EntityTypeActionType.EntityCreate)
  async handleCreateJob(job: AutomationJob<EntityCreateVariables>): Promise<{ variables?: unknown }> {
    if (!job.variables?.accountId || !job.variables?.entity || !job.variables?.entitySettings) {
      this.logger.warn(`Automation job variables are not valid`, job.variables);
      return { variables: job.variables };
    }

    try {
      const { accountId, entity, entitySettings } = job.variables;

      const current = await this.entityService.findOne(accountId, { entityId: entity.id });
      if (current && (!current.stageId || entitySettings.allowAnyStage || current.stageId === entity.stageId)) {
        const user = await this.userService.findOne({ accountId, id: entity.responsibleUserId });
        const [created] = await this.entityService.createSimple({
          accountId,
          user,
          dto: {
            entityTypeId: entitySettings.entityTypeId,
            boardId: entitySettings.boardId,
            stageId: entitySettings.stageId,
            ownerId: entitySettings.ownerId,
            name: entitySettings.name,
          },
          options: { linkedEntities: [entity.id] },
        });

        const createdVar = await this.entityEmitter.createEntityVariable({ accountId, entity: created });
        return { variables: { ...job.variables, entity: createdVar } };
      }
    } catch (e) {
      this.logger.error(`Automation job error`, (e as Error)?.stack);
    }
    return { variables: job.variables };
  }
}
