import { registerAs } from '@nestjs/config';

export interface AppsumoConfig {
  clientId: string;
  clientSecret: string;
  privateKey: string;
}

export default registerAs(
  'appsumo',
  (): AppsumoConfig => ({
    clientId: process.env.APPSUMO_CLIENT_ID,
    clientSecret: process.env.APPSUMO_CLIENT_SECRET,
    privateKey: process.env.APPSUMO_PRIVATE_KEY,
  }),
);
