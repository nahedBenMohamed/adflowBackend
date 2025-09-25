import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IamEventType, UserCreatedEvent } from '@/modules/iam/common';
import { UserService } from '@/modules/iam/user/user.service';
import { User } from '@/modules/iam/user/entities/user.entity';

import { EntityTypeService } from '@/CRM/entity-type/entity-type.service';

import { NotificationType } from '../notification/enums';

import { NotificationSettings } from './entities/notification-settings.entity';
import { NotificationTypeSettings } from './entities/notification-type-settings.entity';
import { NotificationTypeFollowUser } from './entities/notification-type-follow-user.entity';

import { NotificationSettingsDto } from './dto/notification-settings.dto';
import { NotificationTypeSettingsDto } from './dto/notification-type-settings.dto';

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectRepository(NotificationSettings)
    private readonly repositorySettings: Repository<NotificationSettings>,
    @InjectRepository(NotificationTypeSettings)
    private readonly repositoryTypeSettings: Repository<NotificationTypeSettings>,
    @InjectRepository(NotificationTypeFollowUser)
    private readonly repositoryFollowUser: Repository<NotificationTypeFollowUser>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => EntityTypeService))
    private readonly entityTypeService: EntityTypeService,
  ) {}

  @OnEvent(IamEventType.UserCreated, { async: true })
  public async handleUserCreatedEvent(event: UserCreatedEvent) {
    const user = await this.userService.findOne({ accountId: event.accountId, id: event.userId });
    await this.createDefaultSettings(event.accountId, user);
  }

  public async createDefaultSettings(accountId: number, user: User) {
    const settings = await this.repositorySettings.save(new NotificationSettings(accountId, user.id, true));
    const typeSettings: NotificationTypeSettings[] = [];
    await this.createMissedTypes(accountId, user, settings.id, typeSettings);
    return { settings, typeSettings };
  }
  private async createMissedTypes(
    accountId: number,
    user: User,
    settingsId: number,
    typeSettings: NotificationTypeSettings[] = [],
  ) {
    for (const typeString in NotificationType) {
      const type = NotificationType[typeString] as NotificationType;
      if (type !== NotificationType.ENTITY_NEW && !typeSettings.find((t) => t.type === type)) {
        typeSettings.push(await this.createDefaultTypeSettings(accountId, settingsId, type));
      }
    }

    const entityTypes = await this.entityTypeService.getAccessibleForUser(accountId, user);
    const deletedEntityTypes: number[] = [];
    for (const typeSetting of typeSettings.filter((ts) => ts.type === NotificationType.ENTITY_NEW)) {
      if (!entityTypes.some((et) => et.id === typeSetting.objectId)) {
        deletedEntityTypes.push(typeSetting.id);
      }
    }
    for (const id of deletedEntityTypes) {
      const index = typeSettings.findIndex((ts) => ts.id === id);
      if (index !== -1) {
        typeSettings.splice(index, 1);
      }
    }

    for (const et of entityTypes) {
      if (!typeSettings.find((t) => t.type === NotificationType.ENTITY_NEW && t.objectId === et.id)) {
        typeSettings.push(
          await this.createDefaultTypeSettings(accountId, settingsId, NotificationType.ENTITY_NEW, et.id),
        );
      }
    }
  }
  private async createDefaultTypeSettings(
    accountId: number,
    settingsId: number,
    type: NotificationType,
    objectId: number | null = null,
  ): Promise<NotificationTypeSettings> {
    return await this.repositoryTypeSettings.save(
      NotificationTypeSettings.createDefault(accountId, settingsId, type, objectId),
    );
  }

  public async getSettings(accountId: number, user: User): Promise<NotificationSettingsDto> {
    const current = await this.repositorySettings.findOneBy({ accountId, userId: user.id });
    if (current) {
      const typeSettings = await this.repositoryTypeSettings.find({
        where: { settingsId: current.id },
        order: { id: 'ASC' },
      });
      await this.createMissedTypes(accountId, user, current.id, typeSettings);
      return current.toDto(await this.convertToTypeSettingsDto(typeSettings));
    } else {
      const { settings, typeSettings } = await this.createDefaultSettings(accountId, user);
      return settings.toDto(await this.convertToTypeSettingsDto(typeSettings));
    }
  }
  private async convertToTypeSettingsDto(typeSettings: NotificationTypeSettings[]) {
    const typeSettingsDtos: NotificationTypeSettingsDto[] = [];
    for (const ts of typeSettings) {
      const followUsers = await this.repositoryFollowUser.findBy({ typeId: ts.id });
      typeSettingsDtos.push(ts.toDto(followUsers.map((fu) => fu.userId)));
    }
    return typeSettingsDtos;
  }

  public async updateSettings(
    accountId: number,
    user: User,
    dto: NotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    let settings = await this.repositorySettings.findOneBy({ accountId, userId: user.id });
    if (settings) {
      await this.repositorySettings.save(settings.update(dto));
    } else {
      settings = await this.repositorySettings.save(NotificationSettings.create(accountId, user.id, dto));
    }

    await this.repositoryTypeSettings.delete({ settingsId: settings.id });
    for (const type of dto.types) {
      const typeSettings = await this.repositoryTypeSettings.save(
        NotificationTypeSettings.fromDto(accountId, settings.id, type),
      );
      if (type.followUserIds && type.followUserIds.length > 0) {
        await this.repositoryFollowUser.insert(
          type.followUserIds.map((fu) => new NotificationTypeFollowUser(typeSettings.id, fu, accountId)),
        );
      }
    }

    return await this.getSettings(accountId, user);
  }

  public async checkEnabled(
    accountId: number,
    userId: number,
    type: NotificationType,
    objectId: number | null = null,
  ): Promise<{ isEnabled: boolean; enablePopup: boolean }> {
    const settings = await this.repositorySettings.findOneBy({ accountId, userId });
    if (settings) {
      const typeSettings = await this.repositoryTypeSettings.findOneBy({
        settingsId: settings.id,
        type,
        objectId: objectId ?? undefined,
      });
      if (typeSettings) {
        return { isEnabled: typeSettings.isEnabled, enablePopup: settings.enablePopup };
      }
    }
    return {
      isEnabled: NotificationTypeSettings.getDefaultEnabled(type),
      enablePopup: NotificationSettings.getDefaultEnablePopup(),
    };
  }

  public async getNotificationSettingsWithBefore(type: NotificationType, offset: number, limit: number) {
    const result: { userId: number; before: number }[] = await this.repositoryTypeSettings
      .createQueryBuilder('nts')
      .select('ns.user_id', 'userId')
      .addSelect('nts.before', 'before')
      .leftJoin('notification_settings', 'ns', 'nts.settings_id = ns.id')
      .where('nts.type = :type', { type })
      .andWhere('nts.is_enabled = true')
      .offset(offset)
      .limit(limit)
      .getRawMany();
    return result;
  }

  public async getNotificationSettingsWithFollow(type: NotificationType, offset: number, limit: number) {
    const result: { userId: number; typeId: number }[] = await this.repositoryTypeSettings
      .createQueryBuilder('nts')
      .select('ns.user_id', 'userId')
      .addSelect('nts.id', 'typeId')
      .leftJoin('notification_settings', 'ns', 'nts.settings_id = ns.id')
      .where('nts.type = :type', { type })
      .andWhere('nts.is_enabled = true')
      .offset(offset)
      .limit(limit)
      .getRawMany();
    return await Promise.all(
      result.map(async (r) => {
        return {
          ...r,
          followUserIds: (await this.repositoryFollowUser.findBy({ typeId: r.typeId })).map((f) => f.userId),
        };
      }),
    );
  }
}
