import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { CreateNotificationDto, NotificationDto } from '../dto';
import { NotificationType } from '../enums';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  userId: number;

  @Column()
  type: NotificationType;

  @Column()
  objectId: number;

  @Column({ nullable: true })
  entityId: number | null;

  @Column({ nullable: true })
  fromUser: number | null;

  @Column({ nullable: true })
  title: string | null;

  @Column({ nullable: true })
  description: string | null;

  @Column()
  isSeen: boolean;

  @Column({ nullable: true })
  startsIn: number | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    userId: number,
    type: NotificationType,
    objectId: number,
    entityId: number | null,
    fromUser: number | null,
    title: string | null,
    description: string | null,
    isSeen: boolean,
    startsIn: number | null,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.userId = userId;
    this.type = type;
    this.objectId = objectId;
    this.entityId = entityId;
    this.fromUser = fromUser;
    this.title = title;
    this.description = description;
    this.isSeen = isSeen;
    this.startsIn = startsIn;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public static fromDto(dto: CreateNotificationDto) {
    return new Notification(
      dto.accountId,
      dto.userId,
      dto.type,
      dto.objectId,
      dto.entityId,
      dto.fromUser,
      dto.title,
      dto.description,
      false,
      dto.startsIn,
    );
  }

  public toDto(entityInfo: EntityInfoDto | null): NotificationDto {
    return new NotificationDto(
      this.id,
      this.userId,
      this.type,
      this.objectId,
      entityInfo,
      this.fromUser,
      this.title,
      this.description,
      this.isSeen,
      this.startsIn,
      this.createdAt.toISOString(),
    );
  }
}
