import { registerAs } from '@nestjs/config';

export interface FacebookConfig {
  appId: string;
  appSecret: string;
  appAccessToken: string;
  messengerAuthConfigId: string;
  messengerValidationToken: string;
}

export default registerAs(
  'facebook',
  (): FacebookConfig => ({
    appId: process.env.FB_APP_ID,
    appSecret: process.env.FB_APP_SECRET,
    appAccessToken: process.env.FB_APP_ACCESS_TOKEN,
    messengerAuthConfigId: process.env.FB_MESSENGER_AUTH_CONFIG_ID,
    messengerValidationToken: process.env.FB_MESSENGER_VALIDATION_TOKEN,
  }),
);
