import { PhoneUserInfoDto } from '../dto';

export class PhoneUserInfo {
  utcOffset: number | null;
  country: string | null;
  region: string | null;
  city: string | null;

  constructor(data: Omit<PhoneUserInfo, 'toDto'>) {
    this.utcOffset = data.utcOffset;
    this.country = data.country;
    this.region = data.region;
    this.city = data.city;
  }

  toDto(): PhoneUserInfoDto {
    return {
      utcOffset: this.utcOffset,
      country: this.country,
      region: this.region,
      city: this.city,
    };
  }
}
