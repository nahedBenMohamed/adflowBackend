import { ActionHttpCallSettings } from './action-http-call-settings.dto';

export class ProcessDataDto {
  entityId: number;
  entityStageId?: number;
  data?: unknown;
  settings: ActionHttpCallSettings;
}
