import { registerAs } from '@nestjs/config';

export interface AnalyticsConfig {
  gaMeasurementId: string;
  gaApiSecret: string;
}

export default registerAs(
  'analytics',
  (): AnalyticsConfig => ({
    gaMeasurementId: process.env.GA_MEASUREMENT_ID,
    gaApiSecret: process.env.GA_API_SECRET,
  }),
);
