import { AppsumoEventType } from '../enums';

export class AppsumoWebhookResponse {
  success: boolean;
  event: AppsumoEventType;
  message?: string;
}
