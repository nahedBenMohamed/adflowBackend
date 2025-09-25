import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
import type { Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { AutomationProcessService } from '../automation-process';
import {
  AutomationDelayUtil,
  AutomationEventType,
  AutomationProcessType,
  AutomatonConditionUtil,
  EntityTypeApplyEvent,
} from '../common';

import type {
  ActionEntityResponsibleChangeSettings,
  CreateAutomationEntityTypeDto,
  UpdateAutomationEntityTypeDto,
} from './dto';
import { AutomationEntityType } from './entities';
import { EntityTypeActionType, EntityTypeTrigger } from './enums';

interface FindFilter {
  accountId: number;
  automationId?: number;
  entityTypeId?: number;
  boardId?: number;
  stageId?: number;
  isActive?: boolean;
  createdBy?: number;
}

interface DeleteActionsCriteria {
  entityTypeId?: number;
  boardId?: number;
  stageId?: number;
  mailboxId?: number;
  providerId?: number;
  responsibleUserId?: number;
}

interface UpdateActionsCriteria {
  responsibleUserId?: number;
}

interface UpdateActionsPayload {
  newResponsibleUserId?: number;
}

interface DeleteConditionsCriteria {
  fieldId?: number;
}

@Injectable()
export class AutomationEntityTypeService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(AutomationEntityType)
    private readonly repository: Repository<AutomationEntityType>,
    private readonly processService: AutomationProcessService,
  ) {}

  async create({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: CreateAutomationEntityTypeDto;
  }): Promise<AutomationEntityType> {
    let automation = await this.repository.save(AutomationEntityType.fromDto(accountId, userId, dto));
    if (dto.isActive) {
      automation = await this.activate(automation);
    }
    if (automation.isActive && dto.applyImmediately) {
      this.apply({ accountId, automation });
    }

    return automation;
  }

  async findOne(filter: FindFilter): Promise<AutomationEntityType | null> {
    return this.createFindQb(filter).getOne();
  }
  async findMany(filter: FindFilter): Promise<AutomationEntityType[]> {
    return this.createFindQb(filter).orderBy('created_at').getMany();
  }

  async generateBpmn({ accountId, automationId }: { accountId: number; automationId: number }): Promise<string> {
    const automation = await this.findOne({ accountId, automationId });
    if (!automation) {
      throw NotFoundError.withId(AutomationEntityType, automationId);
    }

    return await this.generate(automation);
  }

  async update({
    accountId,
    automationId,
    dto,
  }: {
    accountId: number;
    automationId: number;
    dto: UpdateAutomationEntityTypeDto;
  }): Promise<AutomationEntityType> {
    let automation = await this.findOne({ accountId, automationId });
    if (!automation) {
      throw NotFoundError.withId(AutomationEntityType, automationId);
    }

    const wasActive = automation.isActive;
    if (automation.isActive) {
      await this.deactivate(automation);
      automation.processId = null;
      await this.repository.save(automation);
    }

    this.repository.save(automation.update(dto));

    if (dto.isActive || (dto.isActive === undefined && wasActive)) {
      automation = await this.activate(automation);
    }
    if (automation.isActive && dto.applyImmediately) {
      this.apply({ accountId, automation });
    }

    return automation;
  }

  async changeOwner({
    accountId,
    currentUserId,
    newUserId,
  }: {
    accountId: number;
    currentUserId: number;
    newUserId: number;
  }) {
    await this.repository.update({ accountId, createdBy: currentUserId }, { createdBy: newUserId });
  }

  async deleteMany(filter: FindFilter) {
    const automations = await this.findMany(filter);
    for (const automation of automations) {
      await this.delete({ accountId: automation.accountId, automationId: automation.id });
    }
  }

  async delete({ accountId, automationId }: { accountId: number; automationId: number }): Promise<number> {
    const automation = await this.findOne({ accountId, automationId });
    if (!automation) {
      throw NotFoundError.withId(AutomationEntityType, automationId);
    }

    await this.deleteAutomation(automation);

    return automation.id;
  }

  async updateByActionsCriteria({
    accountId,
    type,
    criteria,
    payload,
  }: {
    accountId: number;
    type: EntityTypeActionType;
    criteria: UpdateActionsCriteria;
    payload: UpdateActionsPayload;
  }) {
    switch (type) {
      case EntityTypeActionType.EntityResponsibleChange:
        if (criteria.responsibleUserId && payload.newResponsibleUserId) {
          const automations = await this.createFindQb({ accountId })
            .andWhere(
              // eslint-disable-next-line max-len
              `jsonb_path_exists(actions, '$[*] ? (@.type == "${type}" && @.settings.responsibleUserId == ${criteria.responsibleUserId})')`,
            )
            .getMany();

          for (const automation of automations) {
            const updatedActions = automation.actions.map((action) => {
              if (
                (action.settings as ActionEntityResponsibleChangeSettings).responsibleUserId ===
                criteria.responsibleUserId
              ) {
                return {
                  ...action,
                  settings: {
                    ...action.settings,
                    responsibleUserId: payload.newResponsibleUserId,
                  },
                };
              }
              return action;
            });

            const wasActive = automation.isActive;

            if (automation.isActive) {
              await this.deactivate(automation);
            }

            await this.repository.save(automation.update({ actions: updatedActions }));

            if (wasActive) {
              await this.activate(automation);
            }
          }
        }
    }
  }

  async deleteByActionsCriteria({
    accountId,
    type,
    criteria,
  }: {
    accountId: number;
    type: EntityTypeActionType;
    criteria: DeleteActionsCriteria;
  }) {
    let automations: AutomationEntityType[] = [];
    switch (type) {
      case EntityTypeActionType.EntityCreate:
        if (criteria.entityTypeId) {
          automations = await this.createFindQb({ accountId })
            .andWhere(
              // eslint-disable-next-line max-len
              `jsonb_path_exists(actions, '$[*] ? (@.type == "${type}" && @.settings.entityTypeId == ${criteria.entityTypeId})')`,
            )
            .getMany();
        }
        if (criteria.boardId) {
          automations = await this.createFindQb({ accountId })
            .andWhere(
              `jsonb_path_exists(actions, '$[*] ? (@.type == "${type}" && @.settings.boardId == ${criteria.boardId})')`,
            )
            .getMany();
        }
        if (criteria.stageId) {
          automations = await this.createFindQb({ accountId })
            .andWhere(
              `jsonb_path_exists(actions, '$[*] ? (@.type == "${type}" && @.settings.stageId == ${criteria.stageId})')`,
            )
            .getMany();
        }
        break;
      case EntityTypeActionType.EntityStageChange:
        if (criteria.stageId) {
          automations = await this.createFindQb({ accountId })
            .andWhere(
              `jsonb_path_exists(actions, '$[*] ? (@.type == "${type}" && @.settings.stageId == ${criteria.stageId})')`,
            )
            .getMany();
        }
        break;
      case EntityTypeActionType.EntityLinkedStageChange:
        if (criteria.entityTypeId) {
          automations = await this.createFindQb({ accountId })
            .andWhere(
              // eslint-disable-next-line max-len
              `jsonb_path_exists(actions, '$[*] ? (@.type == "${type}" && @.settings.entityTypeId == ${criteria.entityTypeId})')`,
            )
            .getMany();
        }
        if (criteria.stageId) {
          automations = await this.createFindQb({ accountId })
            .andWhere(
              `jsonb_path_exists(actions, '$[*] ? (@.type == "${type}" && @.settings.stageId == ${criteria.stageId})')`,
            )
            .getMany();
        }
        break;
      case EntityTypeActionType.EntityResponsibleChange:
        if (criteria.responsibleUserId) {
          automations = await this.createFindQb({ accountId })
            .andWhere(
              // eslint-disable-next-line max-len
              `jsonb_path_exists(actions, '$[*] ? (@.type == "${type}" && @.settings.responsibleUserId == ${criteria.responsibleUserId})')`,
            )
            .getMany();
        }
        break;
      case EntityTypeActionType.EmailSend:
        if (criteria.mailboxId) {
          automations = await this.createFindQb({ accountId })
            .andWhere(
              // eslint-disable-next-line max-len
              `jsonb_path_exists(actions, '$[*] ? (@.type == "${type}" && @.settings.mailboxId == ${criteria.mailboxId})')`,
            )
            .getMany();
        }
        break;
      case EntityTypeActionType.ChatSendExternal:
        if (criteria.providerId) {
          automations = await this.createFindQb({ accountId })
            .andWhere(
              // eslint-disable-next-line max-len
              `jsonb_path_exists(actions, '$[*] ? (@.type == "${type}" && @.settings.providerId == ${criteria.providerId})')`,
            )
            .getMany();
        }
        break;
    }

    for (const automation of automations) {
      await this.deleteAutomation(automation);
    }
  }

  async deleteByConditionsCriteria({ accountId, criteria }: { accountId: number; criteria: DeleteConditionsCriteria }) {
    const automations = await this.createFindQb({ accountId })
      .andWhere(`jsonb_path_exists(conditions, '$.fields[*] ? (@.fieldId == ${criteria.fieldId})')`)
      .getMany();

    for (const automation of automations) {
      await this.deleteAutomation(automation);
    }
  }

  private async deleteAutomation(automation: AutomationEntityType) {
    if (automation.isActive) {
      await this.deactivate(automation);
    }

    await this.repository.delete(automation.id);
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId: filter.accountId });

    if (filter?.automationId) {
      qb.andWhere('id = :id', { id: filter.automationId });
    }
    if (filter?.entityTypeId) {
      qb.andWhere('entity_type_id = :entityTypeId', { entityTypeId: filter.entityTypeId });
    }
    if (filter?.boardId) {
      qb.andWhere('board_id = :boardId', { boardId: filter.boardId });
    }
    if (filter?.stageId) {
      qb.andWhere('stage_id = :stageId', { stageId: filter.stageId });
    }
    if (filter?.isActive !== undefined) {
      qb.andWhere('is_active = :isActive', { isActive: filter.isActive });
    }
    if (filter?.createdBy) {
      qb.andWhere('created_by = :createdBy', { createdBy: filter.createdBy });
    }

    return qb;
  }

  private async activate(automation: AutomationEntityType): Promise<AutomationEntityType> {
    const bpmn = await this.generate(automation);

    const process = await this.processService.create({
      accountId: automation.accountId,
      userId: automation.createdBy,
      dto: {
        name: automation.name,
        type: AutomationProcessType.EntityType,
        objectId: automation.entityTypeId,
        isActive: true,
        isReadonly: true,
        bpmnFile: bpmn,
      },
    });

    await this.repository.save(automation.update({ processId: process.id }));

    return automation;
  }

  private async deactivate(automation: AutomationEntityType): Promise<AutomationEntityType> {
    const processId = automation.processId;
    await this.repository.save(automation.update({ processId: null }));

    await this.processService.delete({ accountId: automation.accountId, processId });

    return automation;
  }

  private async apply({ accountId, automation }: { accountId: number; automation: AutomationEntityType }) {
    this.eventEmitter.emit(
      AutomationEventType.EntityTypeApply,
      new EntityTypeApplyEvent({
        accountId,
        automationId: automation.id,
        processId: automation.processId,
        entityTypeId: automation.entityTypeId,
        boardId: automation.boardId,
        stageId: automation.stageId,
      }),
    );
  }

  private async generate(automation: AutomationEntityType): Promise<string | null> {
    const action = automation.actions?.[0];
    if (action) {
      const content: string = readFileSync(path.join(__dirname, 'templates/simple_automation.bpmn.template'), 'utf-8');

      const template = Handlebars.compile(content);
      const result = template({
        accountId: automation.accountId,
        entityTypeId: automation.entityTypeId,
        processId: automation.id,
        name: automation.name,
        events: {
          create: automation.triggers.includes(EntityTypeTrigger.Create),
          changeStage: automation.triggers.includes(EntityTypeTrigger.ChangeStage),
          changeOwner: automation.triggers.includes(EntityTypeTrigger.ChangeOwner),
        },
        conditions: AutomatonConditionUtil.formatEntityCondition({
          stageId: automation.stageId,
          ownerIds: automation.conditions?.ownerIds,
          fields: automation.conditions?.fields,
        }),
        action: {
          delay: AutomationDelayUtil.formatSeconds(action.delay),
          type: action.type,
          target: this.formatTarget(action.type),
          settings: JSON.stringify(action.settings),
        },
      });

      return result;
    }

    return null;
  }

  private formatTarget(type: EntityTypeActionType): string {
    switch (type) {
      case EntityTypeActionType.CreateTask:
      case EntityTypeActionType.TaskCreate:
        return 'taskSettings';
      case EntityTypeActionType.CreateActivity:
      case EntityTypeActionType.ActivityCreate:
        return 'activitySettings';
      case EntityTypeActionType.SendEmail:
      case EntityTypeActionType.EmailSend:
        return 'emailSettings';
      case EntityTypeActionType.ChangeStage:
      case EntityTypeActionType.EntityCreate:
      case EntityTypeActionType.EntityStageChange:
      case EntityTypeActionType.EntityLinkedStageChange:
      case EntityTypeActionType.EntityResponsibleChange:
        return 'entitySettings';
      case EntityTypeActionType.ChatSendAmwork:
      case EntityTypeActionType.ChatSendExternal:
        return 'chatSettings';
      case EntityTypeActionType.HttpCall:
        return 'httpSettings';
    }
  }
}
