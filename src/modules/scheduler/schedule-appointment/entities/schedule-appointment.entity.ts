import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { Authorizable, AuthorizableObject, SimpleAuthorizable, UserRights } from '@/modules/iam/common';
import { Order } from '@/modules/inventory/order/entities/order.entity';
import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { PermissionObjectType, ScheduleAppointmentStatus } from '../../common';
import { SchedulePerformer } from '../../schedule-performer';

import { CreateScheduleAppointmentDto, UpdateScheduleAppointmentDto, ScheduleAppointmentDto } from '../dto';

@Entity()
export class ScheduleAppointment implements Authorizable {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  @Column()
  scheduleId: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  status: ScheduleAppointmentStatus;

  @Column({ nullable: true })
  title: string | null;

  @Column({ nullable: true })
  comment: string | null;

  @Column()
  ownerId: number;

  @Column({ nullable: true })
  entityId: number | null;

  @Column()
  performerId: number;

  @Column({ nullable: true })
  orderId: number | null;

  @Column()
  externalId: string | null;

  constructor(
    accountId: number,
    scheduleId: number,
    startDate: Date,
    endDate: Date,
    status: ScheduleAppointmentStatus,
    title: string | null,
    comment: string | null,
    ownerId: number,
    entityId: number | null,
    performerId: number,
    orderId: number | null,
    externalId: string | null,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.scheduleId = scheduleId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.title = title;
    this.comment = comment;
    this.ownerId = ownerId;
    this.entityId = entityId;
    this.performerId = performerId;
    this.orderId = orderId;
    this.externalId = externalId;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _performer: SchedulePerformer | null;
  public get performer(): SchedulePerformer | null {
    return this._performer;
  }
  public set performer(value: SchedulePerformer | null) {
    this._performer = value;
  }

  private _prevAppointmentCount: number | null;
  public get prevAppointmentCount(): number | null {
    return this._prevAppointmentCount;
  }
  public set prevAppointmentCount(value: number | null) {
    this._prevAppointmentCount = value;
  }

  private _userRights: UserRights | null;
  public get userRights(): UserRights | null {
    return this._userRights;
  }
  public set userRights(value: UserRights | null) {
    this._userRights = value;
  }

  private _order: Order | null;
  public get order(): Order | null {
    return this._order;
  }
  public set order(value: Order | null) {
    this._order = value;
  }

  private _entityInfo: EntityInfoDto | null;
  public get entityInfo(): EntityInfoDto | null {
    return this._entityInfo;
  }
  public set entityInfo(value: EntityInfoDto | null) {
    this._entityInfo = value;
  }

  public static fromDto(
    accountId: number,
    createdBy: number,
    dto: CreateScheduleAppointmentDto,
    timePeriod: number | null,
  ): ScheduleAppointment {
    const start = DateUtil.fromISOString(dto.startDate);
    const end = dto.endDate ? DateUtil.fromISOString(dto.endDate) : DateUtil.add(start, { seconds: timePeriod });
    return new ScheduleAppointment(
      accountId,
      dto.scheduleId,
      start,
      end,
      dto.status,
      dto.title,
      dto.comment,
      dto.ownerId ?? createdBy,
      dto.entityId,
      dto.performerId,
      dto.orderId ?? null,
      dto.externalId ?? null,
    );
  }

  public update(dto: UpdateScheduleAppointmentDto): ScheduleAppointment {
    this.scheduleId = dto.scheduleId !== undefined ? dto.scheduleId : this.scheduleId;
    this.startDate = dto.startDate !== undefined ? DateUtil.fromISOString(dto.startDate) : this.startDate;
    this.endDate = dto.endDate !== undefined ? DateUtil.fromISOString(dto.endDate) : this.endDate;
    this.status = dto.status !== undefined ? dto.status : this.status;
    this.title = dto.title !== undefined ? dto.title : this.title;
    this.comment = dto.comment !== undefined ? dto.comment : this.comment;
    this.entityId = dto.entityId !== undefined ? dto.entityId : this.entityId;
    this.performerId = dto.performerId !== undefined ? dto.performerId : this.performerId;
    this.orderId = dto.orderId !== undefined ? dto.orderId : this.orderId;
    this.ownerId = dto.ownerId !== undefined ? dto.ownerId : this.ownerId;
    this.externalId = dto.externalId !== undefined ? dto.externalId : this.externalId;

    return this;
  }

  public hasChanges(dto: UpdateScheduleAppointmentDto): boolean {
    return (
      (dto.scheduleId !== undefined && dto.scheduleId !== this.scheduleId) ||
      (dto.startDate !== undefined && DateUtil.fromISOString(dto.startDate) !== this.startDate) ||
      (dto.endDate !== undefined && DateUtil.fromISOString(dto.endDate) !== this.endDate) ||
      (dto.status !== undefined && dto.status !== this.status) ||
      (dto.title !== undefined && dto.title !== this.title) ||
      (dto.comment !== undefined && dto.comment !== this.comment) ||
      (dto.entityId !== undefined && dto.entityId !== this.entityId) ||
      (dto.performerId !== undefined && dto.performerId !== this.performerId) ||
      (dto.orderId !== undefined && dto.orderId !== this.orderId) ||
      (dto.ownerId !== undefined && dto.ownerId !== this.ownerId) ||
      (dto.externalId !== undefined && dto.externalId !== this.externalId)
    );
  }

  public toDto(): ScheduleAppointmentDto {
    return {
      id: this.id,
      scheduleId: this.scheduleId,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      status: this.status,
      title: this.title,
      comment: this.comment,
      ownerId: this.ownerId,
      entityId: this.entityId,
      performerId: this.performerId,
      orderId: this.orderId,
      prevAppointmentCount: this.prevAppointmentCount,
      createdAt: this.createdAt.toISOString(),
      userRights: this.userRights ?? UserRights.full(),
      order: this.order?.toDto(),
      entityInfo: this.entityInfo,
      externalId: this.externalId,
    };
  }

  static getAuthorizable(scheduleId: number): Authorizable {
    return new SimpleAuthorizable({ type: PermissionObjectType.Schedule, id: scheduleId });
  }

  getAuthorizableObject(): AuthorizableObject {
    return {
      type: PermissionObjectType.Schedule,
      id: this.scheduleId,
      createdBy: this.ownerId,
      ownerId: this.performer?.userId,
      departmentId: this.performer?.departmentId,
    };
  }
}
