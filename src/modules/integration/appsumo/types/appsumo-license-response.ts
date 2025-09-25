import { AppsumoLicenseStatus } from '../enums';

export class AppsumoLicenseResponse {
  license_key: string;
  status: AppsumoLicenseStatus;
  scopes: string[];
}
