import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { NotificationType } from '../../notification/enums';
import { NotificationTypeSettingsDto } from '../dto/notification-type-settings.dto';

@Entity()
export class NotificationTypeSettings {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  settingsId: number;

  @Column()
  type: NotificationType;

  @Column()
  isEnabled: boolean;

  @Column({ nullable: true })
  objectId: number | null;

  @Column({ nullable: true })
  before: number | null; // in seconds

  @Column()
  accountId: number;

  constructor(
    accountId: number,
    settingsId: number,
    type: NotificationType,
    isEnabled: boolean,
    objectId: number | null,
    before: number | null,
  ) {
    this.accountId = accountId;
    this.settingsId = settingsId;
    this.type = type;
    this.isEnabled = isEnabled;
    this.objectId = objectId;
    this.before = before;
  }

  public static fromDto(
    accountId: number,
    settingsId: number,
    dto: NotificationTypeSettingsDto,
  ): NotificationTypeSettings {
    return new NotificationTypeSettings(accountId, settingsId, dto.type, dto.isEnabled, dto.objectId, dto.before);
  }

  public static createDefault(
    accountId: number,
    settingsId: number,
    type: NotificationType,
    objectId: number | null = null,
  ): NotificationTypeSettings {
    return new NotificationTypeSettings(
      accountId,
      settingsId,
      type,
      NotificationTypeSettings.getDefaultEnabled(type),
      objectId,
      NotificationTypeSettings.getDefaultBefore(type),
    );
  }

  public static getDefaultEnabled(type: NotificationType): boolean {
    return !(type === NotificationType.ACTIVITY_OVERDUE_EMPLOYEE || type === NotificationType.TASK_OVERDUE_EMPLOYEE);
  }
  public static getDefaultBefore(type: NotificationType): number | null {
    return type === NotificationType.ACTIVITY_BEFORE_START || type === NotificationType.TASK_BEFORE_START ? 3600 : null;
  }

  public toDto(followUserIds: number[] | null): NotificationTypeSettingsDto {
    return new NotificationTypeSettingsDto(this.type, this.isEnabled, this.objectId, this.before, followUserIds);
  }
}
