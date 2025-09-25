import { registerAs } from '@nestjs/config';

export interface DataEnrichmentConfig {
  geohelperApiKey: string;
  dadataApiKey: string;
}

export default registerAs(
  'data-enrichment',
  (): DataEnrichmentConfig => ({
    geohelperApiKey: process.env.DATA_ENRICHMENT_GEOHELPER_API_KEY,
    dadataApiKey: process.env.DATA_ENRICHMENT_DADATA_API_KEY,
  }),
);
