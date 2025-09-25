import { registerAs } from '@nestjs/config';

export interface VoximplantConfig {
  accountId: number;
  accountApiKey: string;
  credentialsFile: string;
}

export default registerAs(
  'voximplant',
  (): VoximplantConfig => ({
    accountId: parseInt(process.env.VOXIMPLANT_PARENT_ACCOUNT_ID, 10),
    accountApiKey: process.env.VOXIMPLANT_PARENT_ACCOUNT_API_KEY,
    credentialsFile: process.env.VOXIMPLANT_CREDENTIALS_FILE,
  }),
);
