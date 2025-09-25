import { registerAs } from '@nestjs/config';

export interface SupportConfig {
  accessCode: string;
}

export default registerAs(
  'support',
  (): SupportConfig => ({
    accessCode: process.env.SUPPORT_ACCESS_CODE,
  }),
);
