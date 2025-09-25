import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { IamEventType, UserDeletedEvent } from '@/modules/iam/common';
import {
  ActionActivityCreateSettings,
  AutomationJob,
  EntityTypeActionType,
  OnAutomationJob,
} from '@/modules/automation';

import { ActivityService } from './activity.service';

interface EntityVariables {
  id?: number | null;
  stageId?: number | null;
  responsibleUserId?: number | null;
}

interface CreateActivityVariables {
  accountId: number;
  entity?: EntityVariables | null;
  activitySettings?: ActionActivityCreateSettings | null;
}

@Injectable()
export class ActivityHandler {
  private readonly logger = new Logger(ActivityHandler.name);
  constructor(private readonly service: ActivityService) {}

  @OnEvent(IamEventType.UserDeleted, { async: true })
  async onUserDeleted(event: UserDeletedEvent) {
    if (event.newUserId) {
      await this.service.changeResponsible({
        accountId: event.accountId,
        currentUserId: event.userId,
        newUserId: event.newUserId,
      });
    }
  }

  /**
   * @deprecated use new @see handleCreateJob instead
   */
  @OnAutomationJob(EntityTypeActionType.CreateActivity)
  async handleCreateJobOld(job: AutomationJob<CreateActivityVariables>): Promise<{ variables?: unknown }> {
    return this.handleCreateJob(job);
  }
  @OnAutomationJob(EntityTypeActionType.ActivityCreate)
  async handleCreateJob(job: AutomationJob<CreateActivityVariables>): Promise<{ variables?: unknown }> {
    if (!job.variables?.accountId || !job.variables?.entity || !job.variables?.activitySettings) {
      this.logger.warn(`Automation job variables are not valid`, job.variables);
      return { variables: job.variables };
    }

    try {
      const { accountId, entity, activitySettings } = job.variables;
      const activity = await this.service.processAutomation({
        accountId,
        entityId: entity.id,
        entityOwnerId: entity.responsibleUserId,
        entityStageId: entity.stageId,
        settings: activitySettings,
      });
      return { variables: { ...job.variables, activity: activity?.toSimpleDto() } };
    } catch (e) {
      this.logger.error(`Automation job error`, (e as Error)?.stack);
      return { variables: job.variables };
    }
  }
}
