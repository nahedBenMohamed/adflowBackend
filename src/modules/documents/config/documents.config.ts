import { registerAs } from '@nestjs/config';

export interface DocumentsConfig {
  host: string;
}

export default registerAs(
  'documents',
  (): DocumentsConfig => ({
    host: process.env.DOCUMENTS_HOST,
  }),
);
