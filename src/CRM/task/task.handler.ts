import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { IamEventType, UserDeletedEvent } from '@/modules/iam/common';
import { ActionTaskCreateSettings, AutomationJob, EntityTypeActionType, OnAutomationJob } from '@/modules/automation';

import { CrmEventType, TaskExtEvent, TaskExtUpsertEvent } from '../common';
import { TaskService } from './task.service';

interface EntityVariables {
  id?: number | null;
  stageId?: number | null;
  responsibleUserId?: number | null;
}

interface CreateTaskVariables {
  accountId: number;
  entity?: EntityVariables | null;
  taskSettings?: ActionTaskCreateSettings | null;
}

@Injectable()
export class TaskHandler {
  private readonly logger = new Logger(TaskHandler.name);
  constructor(private readonly service: TaskService) {}

  @OnEvent(IamEventType.UserDeleted, { async: true })
  public async onUserDeleted(event: UserDeletedEvent) {
    if (event.newUserId) {
      await this.service.changeResponsible({
        accountId: event.accountId,
        currentUserId: event.userId,
        newUserId: event.newUserId,
      });
    }
  }

  @OnEvent(CrmEventType.TaskUpsertExt, { async: true })
  public async onTaskUpsertExt(event: TaskExtUpsertEvent) {
    await this.service.handleUpsertExt(event);
  }

  @OnEvent(CrmEventType.TaskDeleteExt, { async: true })
  public async onTaskDeleteExt(event: TaskExtEvent) {
    const { accountId, boardId, taskId, externalId } = event;
    if (accountId && boardId && externalId) {
      await this.service.delete({ user: null, filter: { accountId, boardId, externalId }, event });
    }
    if (accountId && boardId && taskId) {
      await this.service.delete({ user: null, filter: { accountId, boardId, taskId }, event });
    }
  }

  /**
   * @deprecated use new @see handleCreateJob instead
   */
  @OnAutomationJob(EntityTypeActionType.CreateTask)
  async handleCreateJobOld(job: AutomationJob<CreateTaskVariables>): Promise<{ variables?: unknown }> {
    return this.handleCreateJob(job);
  }
  @OnAutomationJob(EntityTypeActionType.TaskCreate)
  async handleCreateJob(job: AutomationJob<CreateTaskVariables>): Promise<{ variables?: unknown }> {
    if (!job.variables?.accountId || !job.variables?.entity || !job.variables?.taskSettings) {
      this.logger.warn(`Automation job variables are not valid`, job.variables);
      return { variables: job.variables };
    }

    try {
      const { accountId, entity, taskSettings } = job.variables;
      const task = await this.service.processAutomation({
        accountId,
        entityId: entity.id,
        entityOwnerId: entity.responsibleUserId,
        entityStageId: entity.stageId,
        settings: taskSettings,
      });
      return { variables: { ...job.variables, task: task?.toSimpleDto() } };
    } catch (e) {
      this.logger.error(`Automation job error`, (e as Error)?.stack);
      return { variables: job.variables };
    }
  }
}
