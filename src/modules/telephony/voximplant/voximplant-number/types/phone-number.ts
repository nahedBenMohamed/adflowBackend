import { PhoneNumberDto } from '../dto';

export class PhoneNumber {
  externalId: string;
  phoneNumber: string;
  countryCode: string;
  regionName?: string;

  constructor({
    externalId,
    phoneNumber,
    countryCode,
    regionName,
  }: {
    externalId: string;
    phoneNumber: string;
    countryCode: string;
    regionName?: string;
  }) {
    this.externalId = externalId;
    this.phoneNumber = phoneNumber;
    this.countryCode = countryCode;
    this.regionName = regionName;
  }

  public toDto(): PhoneNumberDto {
    return new PhoneNumberDto(this);
  }
}
