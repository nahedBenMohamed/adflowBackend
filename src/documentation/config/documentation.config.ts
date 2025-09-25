import { registerAs } from '@nestjs/config';

export interface DocumentationConfig {
  enabled: boolean;
}

export default registerAs(
  'documentation',
  (): DocumentationConfig => ({
    enabled: process.env.API_DOC_ENABLED === 'true',
  }),
);
