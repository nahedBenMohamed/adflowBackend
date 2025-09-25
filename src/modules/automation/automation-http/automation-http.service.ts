import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import Handlebars from 'handlebars';

import { withTimeout } from '@/common';
import { EntityInfoService } from '@/modules/entity/entity-info/entity-info.service';
import { DocumentGenerationService } from '@/modules/documents/document-generation/document-generation.service';

import { ActionHttpCallSettings } from './dto';

const HttpCallTimeout = 5000;

@Injectable()
export class AutomationHttpService {
  private readonly logger = new Logger(AutomationHttpService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly entityInfoService: EntityInfoService,
    @Inject(forwardRef(() => DocumentGenerationService))
    private readonly documentGenerationService: DocumentGenerationService,
  ) {}

  async processAutomation({
    accountId,
    entityId,
    entityStageId,
    data,
    settings,
  }: {
    accountId: number;
    entityId: number;
    entityStageId: number | null | undefined;
    data?: unknown | null;
    settings: ActionHttpCallSettings;
  }): Promise<object> {
    const entity = await this.entityInfoService.findOne({ accountId, entityId });
    if (entity && (!entity.stageId || settings.allowAnyStage || entity.stageId === entityStageId)) {
      const entityData = await this.documentGenerationService.getDataForGeneration({ accountId, entityId: entity.id });
      const url = Handlebars.compile(settings.url)(entityData);
      const headers = this.applyTemplate({ params: settings.headers, data: entityData });
      const params = this.applyTemplate({ params: settings.params, data: entityData });
      try {
        const response = await withTimeout(
          lastValueFrom(
            this.httpService.request({
              method: settings.method,
              url: url,
              data: data,
              headers: headers,
              params: params,
            }),
          ),
          HttpCallTimeout,
        );
        return response?.data ?? {};
      } catch (error) {
        this.logger.error(`Call webhook error`, (error as Error)?.stack);
        return {};
      }
    }

    return {};
  }

  private applyTemplate({
    params,
    data,
  }: {
    params: Record<string, string> | null | undefined;
    data: object;
  }): Record<string, string> | null {
    if (!params) return null;

    const result: Record<string, string> = {};

    const templateCache = new Map<string, Handlebars.TemplateDelegate>();
    for (const [key, value] of Object.entries(params)) {
      if (!value || !value.includes('{{')) {
        result[key] = value;
      } else {
        let template = templateCache.get(value);
        if (!template) {
          template = Handlebars.compile(value);
          templateCache.set(value, template);
        }
        result[key] = template(data);
      }
    }

    return result;
  }
}
