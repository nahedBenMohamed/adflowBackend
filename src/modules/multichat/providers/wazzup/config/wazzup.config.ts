import { registerAs } from '@nestjs/config';

export interface WazzupConfig {
  secret: string;
  enqueue: boolean;
}

export default registerAs(
  'wazzup',
  (): WazzupConfig => ({ secret: process.env.WAZZUP_SECRET, enqueue: process.env.WAZZUP_PROCESS_ENQUEUE === 'true' }),
);
