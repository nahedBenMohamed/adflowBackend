import { ApiProperty } from '@nestjs/swagger';

import { NotificationTypeSettingsDto } from './notification-type-settings.dto';

export class NotificationSettingsDto {
  @ApiProperty()
  enablePopup: boolean;

  @ApiProperty()
  types: NotificationTypeSettingsDto[];

  constructor(enablePopup: boolean, types: NotificationTypeSettingsDto[]) {
    this.enablePopup = enablePopup;
    this.types = types;
  }
}
