import { ApiProperty } from '@nestjs/swagger';
import { SalesforceSettings } from '../../Model/Settings/SalesforceSettings';

export class SalesforceSettingsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  domain: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  isConnected: boolean;

  constructor(id: string, domain: string, key: string, isConnected: boolean) {
    this.id = id;
    this.domain = domain;
    this.key = key;
    this.isConnected = isConnected;
  }

  public static create(settings: SalesforceSettings) {
    return new SalesforceSettingsDto(settings.id, settings.domain, settings.key, !!settings.refreshToken);
  }
}
