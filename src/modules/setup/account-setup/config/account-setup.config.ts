import { registerAs } from '@nestjs/config';

export interface AccountSetupConfig {
  accountId: number;
  contactId: number;
  dealId: number;
  dealBoardId: number | undefined;
  responsibleId: number;
}

export default registerAs(
  'accountSetup',
  (): AccountSetupConfig => ({
    accountId: process.env.ACCOUNT_SETUP_ACCOUNT_ID ? parseInt(process.env.ACCOUNT_SETUP_ACCOUNT_ID, 10) : undefined,
    contactId: process.env.ACCOUNT_SETUP_CONTACT_ID ? parseInt(process.env.ACCOUNT_SETUP_CONTACT_ID, 10) : undefined,
    dealId: process.env.ACCOUNT_SETUP_DEAL_ID ? parseInt(process.env.ACCOUNT_SETUP_DEAL_ID, 10) : undefined,
    dealBoardId: process.env.ACCOUNT_SETUP_DEAL_BOARD_ID
      ? parseInt(process.env.ACCOUNT_SETUP_DEAL_BOARD_ID, 10)
      : undefined,
    responsibleId: process.env.ACCOUNT_SETUP_RESPONSIBLE_ID
      ? parseInt(process.env.ACCOUNT_SETUP_RESPONSIBLE_ID, 10)
      : undefined,
  }),
);
