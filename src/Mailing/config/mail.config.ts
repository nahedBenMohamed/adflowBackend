import { registerAs } from '@nestjs/config';

interface Mailing {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  replyTo: string;
}

interface GMail {
  apiClientId: string;
  apiClientSecret: string;
}

interface Manual {
  searchTimeout: number;
  searchBatchSize: number;
  partLoadTimeout: number;
}

export interface MailConfig {
  mailing: Mailing;
  gmail: GMail;
  manual: Manual;
}

export default registerAs(
  'mail',
  (): MailConfig => ({
    mailing: {
      host: process.env.MAILING_HOST,
      port: parseInt(process.env.MAILING_PORT, 10) || 465,
      secure: process.env.MAILING_SECURE === 'on',
      user: process.env.MAILING_USER,
      password: process.env.MAILING_PASSWORD,
      from: process.env.MAILING_FROM,
      replyTo: process.env.MAILING_REPLY_TO,
    },
    gmail: {
      apiClientId: process.env.GMAIL_API_CLIENT_ID,
      apiClientSecret: process.env.GMAIL_API_CLIENT_SECRET,
    },
    manual: {
      searchTimeout: parseInt(process.env.MAIL_MANUAL_SEARCH_TIMEOUT, 10) || 30000,
      searchBatchSize: parseInt(process.env.MAIL_MANUAL_SEARCH_BATCH_SIZE, 10) || 100,
      partLoadTimeout: parseInt(process.env.MAIL_MANUAL_PART_LOAD_TIMEOUT, 10) || 15000,
    },
  }),
);
