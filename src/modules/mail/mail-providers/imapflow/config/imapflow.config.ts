import { registerAs } from '@nestjs/config';

export interface ImapflowConfig {
  searchTimeout: number;
  searchBatchSize: number;
  partLoadTimeout: number;
}

export default registerAs(
  'imapflow',
  (): ImapflowConfig => ({
    searchTimeout: parseInt(process.env.MAIL_IMAPFLOW_SEARCH_TIMEOUT, 10) || 30000,
    searchBatchSize: parseInt(process.env.MAIL_IMAPFLOW_SEARCH_BATCH_SIZE, 10) || 100,
    partLoadTimeout: parseInt(process.env.MAIL_IMAPFLOW_PART_LOAD_TIMEOUT, 10) || 15000,
  }),
);
