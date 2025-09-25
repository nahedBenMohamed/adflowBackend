import { registerAs } from '@nestjs/config';

export interface AwsConfig {
  endpointUrl: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export default registerAs(
  'aws',
  (): AwsConfig => ({
    endpointUrl: process.env.AWS_ENDPOINT_URL,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }),
);
