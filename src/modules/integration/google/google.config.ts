import { registerAs } from '@nestjs/config';

interface Auth {
  clientId: string;
  clientSecret: string;
}

export interface GoogleConfig {
  auth: Auth;
}

export default registerAs(
  'google',
  (): GoogleConfig => ({
    auth: {
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    },
  }),
);
