import { AppsumoEventType, AppsumoLicenseStatus } from '../enums';

export interface AppsumoWebhookRequest {
  license_key: string;
  prev_license_key?: string;
  plan_id: string;
  event: AppsumoEventType;
  event_timestamp: number;
  created_at: number;
  license_status: AppsumoLicenseStatus;
  tier: number;
  test: boolean;
  extra: { reason: string };
}
