import { type WazzupMessage } from './wazzup-message';

export class WazzupWebhookRequest {
  test?: boolean;
  messages?: WazzupMessage[];
}
