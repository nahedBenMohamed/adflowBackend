import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DateUtil } from '@/common';

import { UserService } from '@/modules/iam/user/user.service';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';

import { Entity } from '@/CRM/Model/Entity/Entity';
import { EntityService } from '@/CRM/Service/Entity/EntityService';
import { NoteService } from '@/CRM/note/note.service';
import { ActivityService } from '@/CRM/activity/activity.service';
import { TaskService } from '@/CRM/task/task.service';

import { CallStatus, CallDirection } from '../common';
import { VoximplantCall } from '../voximplant-call';

import { VoximplantScenariosDto } from './dto';
import { VoximplantScenarioEntity, VoximplantScenarioNote, VoximplantScenarioTask } from './entities';
import { ScenarioType } from './enums';
import { VoximplantScenarios } from './types';

interface RunScenarioValues {
  phone?: string;
  entityId?: number;
  userId?: number;
}

@Injectable()
export class VoximplantScenarioService {
  constructor(
    @InjectRepository(VoximplantScenarioEntity)
    private readonly repositoryEntity: Repository<VoximplantScenarioEntity>,
    @InjectRepository(VoximplantScenarioNote)
    private readonly repositoryNote: Repository<VoximplantScenarioNote>,
    @InjectRepository(VoximplantScenarioTask)
    private readonly repositoryTask: Repository<VoximplantScenarioTask>,
    private readonly userService: UserService,
    private readonly entityService: EntityService,
    private readonly activityService: ActivityService,
    private readonly taskService: TaskService,
    private readonly noteService: NoteService,
  ) {}

  async upsert(accountId: number, dto: VoximplantScenariosDto): Promise<VoximplantScenarios> {
    await this.repositoryEntity.delete({ accountId });
    await this.repositoryNote.delete({ accountId });
    await this.repositoryTask.delete({ accountId });

    const scenarios = VoximplantScenarios.fromDto(accountId, dto);
    const entities = await this.repositoryEntity.save(scenarios.entities);
    const notes = await this.repositoryNote.save(scenarios.notes);
    const tasks = await this.repositoryTask.save(scenarios.tasks);

    return new VoximplantScenarios(entities, notes, tasks);
  }

  async findOne(accountId: number): Promise<VoximplantScenarios | null> {
    const entities = await this.repositoryEntity.findBy({ accountId });
    const notes = await this.repositoryNote.findBy({ accountId });
    const tasks = await this.repositoryTask.findBy({ accountId });

    return new VoximplantScenarios(entities, notes, tasks);
  }

  async processCall(accountId: number, viCall: VoximplantCall): Promise<{ entities: Entity[] } | null> {
    if (viCall.status === CallStatus.ACCEPTED && !viCall.entityId) {
      return this.runScenario(
        accountId,
        viCall.direction === CallDirection.INCOMING ? ScenarioType.INCOMING_UNKNOWN : ScenarioType.OUTGOING_UNKNOWN,
        { phone: viCall.phoneNumber, userId: viCall.userId },
      );
    }

    if (viCall.status === CallStatus.MISSED) {
      if (viCall.entityId) {
        return this.runScenario(
          accountId,
          viCall.direction === CallDirection.INCOMING
            ? ScenarioType.INCOMING_KNOWN_MISSING
            : ScenarioType.OUTGOING_UNANSWERED,
          { phone: viCall.phoneNumber, userId: viCall.userId, entityId: viCall.entityId },
        );
      } else if (viCall.direction === CallDirection.INCOMING) {
        return this.runScenario(accountId, ScenarioType.INCOMING_UNKNOWN_MISSING, {
          phone: viCall.phoneNumber,
        });
      }
    }

    return null;
  }

  async checkContactsCreationScenarioIsManual(accountId: number, callDirection: CallDirection): Promise<boolean> {
    const scenarioType =
      callDirection === CallDirection.INCOMING ? ScenarioType.INCOMING_UNKNOWN : ScenarioType.OUTGOING_UNKNOWN;
    return !(await this.repositoryEntity.findOneBy({ accountId, scenarioType }));
  }

  private async runScenario(
    accountId: number,
    type: ScenarioType,
    values: RunScenarioValues,
  ): Promise<{ entities: Entity[] }> {
    const scenarios = await this.findOne(accountId);
    const entities: Entity[] = [];
    if (scenarios?.entities) {
      const result = await this.runEntitiesScenarios(
        accountId,
        scenarios.entities.filter((s) => s.scenarioType === type),
        values,
      );
      if (result.entities?.length > 0) {
        entities.push(...result.entities);
      }
    }
    if (!values.entityId && entities.length > 0) {
      const [lastEntity] = entities.slice(-1); // assuming to link task/activity with the last created entity
      values.entityId = lastEntity.id;
    }
    if (scenarios?.tasks) {
      await this.runTasksScenarios(
        accountId,
        scenarios.tasks.filter((s) => s.scenarioType === type),
        values,
      );
    }
    if (scenarios?.notes) {
      await this.runNotesScenarios(
        accountId,
        scenarios.notes.filter((s) => s.scenarioType === type),
        values,
      );
    }

    return { entities };
  }

  private async runEntitiesScenarios(
    accountId: number,
    scenarios: VoximplantScenarioEntity[],
    values: RunScenarioValues,
  ): Promise<{ entities: Entity[] }> {
    if (!values.phone) return { entities: [] };

    const entities: Entity[] = [];
    for (const scenario of scenarios) {
      const ownerId = values.userId ?? scenario.ownerId;
      if (ownerId) {
        const owner = await this.userService.findOne({ accountId, id: ownerId });
        const lead = scenario.dealId
          ? {
              entityTypeId: scenario.dealId,
              boardId: scenario.boardId,
              fieldValues: this.getFieldValues(values),
            }
          : null;
        const contact = scenario.contactId
          ? {
              entityTypeId: scenario.contactId,
              fieldValues: this.getFieldValues(values),
              linkedEntities: lead ? [lead] : undefined,
            }
          : null;
        if (contact || lead) {
          const created = await this.entityService.createSimple({
            accountId,
            user: owner,
            dto: contact ?? lead,
            options: { checkDuplicate: true },
          });
          entities.push(...created);
        }
      }
    }
    return { entities };
  }

  private getFieldValues(values: RunScenarioValues) {
    return values.phone
      ? [
          {
            fieldType: FieldType.Phone,
            value: values.phone.startsWith('+') ? values.phone : '+' + values.phone,
          },
        ]
      : undefined;
  }

  private async runTasksScenarios(accountId: number, scenarios: VoximplantScenarioTask[], values: RunScenarioValues) {
    if (!values.entityId) return;

    const now = DateUtil.now();
    for (const scenario of scenarios) {
      if (scenario.createActivity && scenario.activityOwnerId) {
        const owner = await this.userService.findOne({ accountId, id: scenario.activityOwnerId });
        const endDate = DateUtil.add(now, { seconds: scenario.activityDuration });
        await this.activityService.create(accountId, owner, {
          responsibleUserId: owner.id,
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          text: scenario.activityText,
          activityTypeId: scenario.activityTypeId,
          entityId: values.entityId,
        });
      }
      if (scenario.createTask) {
        const owner = await this.userService.findOne({ accountId, id: scenario.taskOwnerId });
        const endDate = DateUtil.add(now, { seconds: scenario.taskDuration });
        await this.taskService.create({
          accountId,
          user: owner,
          dto: {
            responsibleUserId: owner.id,
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
            text: scenario.taskText,
            title: scenario.taskTitle,
            plannedTime: scenario.taskDuration,
            entityId: values.entityId,
            settingsId: null,
            boardId: null,
            stageId: null,
          },
        });
      }
    }
  }

  private async runNotesScenarios(accountId: number, scenarios: VoximplantScenarioNote[], values: RunScenarioValues) {
    if (!values.entityId || !values.userId) return;

    for (const scenario of scenarios) {
      await this.noteService.create({
        accountId,
        userId: values.userId,
        entityId: values.entityId,
        dto: { text: scenario.noteText },
      });
    }
  }
}
