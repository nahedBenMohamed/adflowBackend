import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { NotificationSettingsDto } from '../dto/notification-settings.dto';
import { NotificationTypeSettingsDto } from '../dto/notification-type-settings.dto';

@Entity()
export class NotificationSettings {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  userId: number;

  @Column()
  enablePopup: boolean;

  @Column()
  accountId: number;

  constructor(accountId: number, userId: number, enablePopup: boolean) {
    this.accountId = accountId;
    this.userId = userId;
    this.enablePopup = enablePopup;
  }

  public static create(accountId: number, userId: number, dto: NotificationSettingsDto): NotificationSettings {
    return new NotificationSettings(accountId, userId, dto.enablePopup);
  }

  public update(dto: NotificationSettingsDto): NotificationSettings {
    this.enablePopup = dto.enablePopup;
    return this;
  }

  public static getDefaultEnablePopup(): boolean {
    return true;
  }

  public toDto(types: NotificationTypeSettingsDto[]): NotificationSettingsDto {
    return new NotificationSettingsDto(this.enablePopup, types);
  }
}
