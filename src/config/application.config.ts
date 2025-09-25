import { registerAs } from '@nestjs/config';

export interface ApplicationConfig {
  baseUrl: string;
  baseUrlTemplate: string;
  port: number;
  name: string;
  apiKeyRequired: boolean;
  feedbackEmail: string;
  supportEmail: string;
  verificationToken: string;
  skeletonKey?: string;
  subdomainPrefix: string;
}

export default registerAs(
  'application',
  (): ApplicationConfig => ({
    baseUrl: process.env.APPLICATION_BASE_URL,
    baseUrlTemplate: process.env.APPLICATION_BASE_URL_TEMPLATE,
    port: parseInt(process.env.APPLICATION_PORT, 10) || 8000,
    name: process.env.APPLICATION_NAME,
    apiKeyRequired: process.env.APPLICATION_API_KEY_REQUIRED === 'true',
    feedbackEmail: process.env.APPLICATION_FEEDBACK_EMAIL,
    supportEmail: process.env.APPLICATION_SUPPORT_EMAIL,
    verificationToken: process.env.APPLICATION_VERIFICATION_TOKEN,
    skeletonKey: process.env.APPLICATION_SKELETON_KEY,
    subdomainPrefix: process.env.APPLICATION_SUBDOMAIN_PREFIX,
  }),
);
