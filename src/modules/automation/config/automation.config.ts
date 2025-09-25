import { registerAs } from '@nestjs/config';

export interface AutomationConfig {
  jobDiscovery: boolean;
}

export default registerAs(
  'automation',
  (): AutomationConfig => ({
    jobDiscovery: ['true', 'on'].includes(process.env.AUTOMATION_JOB_DISCOVERY_ENABLED),
  }),
);
