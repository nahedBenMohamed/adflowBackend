import { Injectable, Logger } from '@nestjs/common';

import { AutomationJob, OnAutomationJob } from '../common';

import { ActionHttpCallSettings } from './dto';
import { HttpActionType } from './enums';
import { AutomationHttpService } from './automation-http.service';

interface EntityVariables {
  id?: number | null;
  stageId?: number | null;
}
interface HttpCallVariables {
  accountId: number;
  entity?: EntityVariables | null;
  httpSettings?: ActionHttpCallSettings | null;
}

@Injectable()
export class AutomationHttpHandler {
  private readonly logger = new Logger(AutomationHttpHandler.name);
  constructor(private readonly service: AutomationHttpService) {}

  @OnAutomationJob(HttpActionType.HttpCall)
  async handleHttpCallJob(job: AutomationJob<HttpCallVariables>): Promise<{ variables?: unknown }> {
    if (!job.variables?.httpSettings) {
      this.logger.warn(`Automation job variables are not valid`, job.variables);
      return { variables: job.variables };
    }

    const { accountId, entity, httpSettings } = job.variables;
    try {
      const result = await this.service.processAutomation({
        accountId,
        entityId: entity.id,
        entityStageId: entity.stageId,
        data: { ...job.variables, httpSettings: undefined },
        settings: httpSettings,
      });
      return { variables: { ...job.variables, ...(result ?? {}) } };
    } catch (e) {
      this.logger.error(`Automation job error`, (e as Error)?.stack);
      return { variables: job.variables };
    }
  }
}
