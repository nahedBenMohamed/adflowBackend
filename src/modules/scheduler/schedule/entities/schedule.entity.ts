import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { Authorizable, SimpleAuthorizable } from '@/modules/iam/common';

import { PermissionObjectType } from '../../common';
import { SchedulePerformer } from '../../schedule-performer';

import { CreateScheduleDto, ScheduleDto, UpdateScheduleDto } from '../dto';
import { ScheduleType } from '../enums';
import { ScheduleTimeInterval } from './schedule-time-interval.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column()
  type: ScheduleType;

  @Column({ default: 1800 })
  timePeriod: number;

  @Column({ nullable: true })
  appointmentLimit: number | null;

  @Column({ nullable: true })
  timeBufferBefore: number | null;

  @Column({ nullable: true })
  timeBufferAfter: number | null;

  @Column({ default: false })
  oneEntityPerDay: boolean;

  @Column({ nullable: true })
  entityTypeId: number | null;

  @Column({ nullable: true })
  productsSectionId: number | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    name: string,
    icon: string,
    type: ScheduleType,
    timePeriod: number,
    appointmentLimit: number | null,
    timeBufferBefore: number | null,
    timeBufferAfter: number | null,
    oneEntityPerDay: boolean,
    entityTypeId: number | null,
    productsSectionId: number | null,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.name = name;
    this.icon = icon;
    this.type = type;
    this.timePeriod = timePeriod;
    this.appointmentLimit = appointmentLimit;
    this.timeBufferBefore = timeBufferBefore;
    this.timeBufferAfter = timeBufferAfter;
    this.oneEntityPerDay = oneEntityPerDay;
    this.entityTypeId = entityTypeId;
    this.productsSectionId = productsSectionId;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _performers: SchedulePerformer[];
  get performers(): SchedulePerformer[] {
    return this._performers;
  }
  set performers(value: SchedulePerformer[]) {
    this._performers = value;
  }

  private _intervals: ScheduleTimeInterval[] | null;
  get intervals(): ScheduleTimeInterval[] | null {
    return this._intervals;
  }
  set intervals(value: ScheduleTimeInterval[] | null) {
    this._intervals = value;
  }

  static fromDto({ accountId, dto }: { accountId: number; dto: CreateScheduleDto }): Schedule {
    return new Schedule(
      accountId,
      dto.name,
      dto.icon,
      dto.type,
      dto.timePeriod ?? 1800,
      dto.appointmentLimit ?? null,
      dto.timeBufferBefore ?? null,
      dto.timeBufferAfter ?? null,
      dto.oneEntityPerDay ?? false,
      dto.entityTypeId,
      dto.productsSectionId,
    );
  }

  toDto(): ScheduleDto {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      type: this.type,
      timePeriod: this.timePeriod,
      appointmentLimit: this.appointmentLimit,
      timeBufferBefore: this.timeBufferBefore,
      timeBufferAfter: this.timeBufferAfter,
      oneEntityPerDay: this.oneEntityPerDay,
      entityTypeId: this.entityTypeId,
      productsSectionId: this.productsSectionId,
      createdAt: this.createdAt.toISOString(),
      performers: this._performers?.map((p) => p.toDto()),
      intervals: this._intervals?.map((interval) => interval.toDto()),
    };
  }

  update(dto: UpdateScheduleDto): Schedule {
    this.name = dto.name !== undefined ? dto.name : this.name;
    this.icon = dto.icon !== undefined ? dto.icon : this.icon;
    this.type = dto.type !== undefined ? dto.type : this.type;
    this.timePeriod = dto.timePeriod !== undefined ? dto.timePeriod : this.timePeriod;
    this.appointmentLimit = dto.appointmentLimit !== undefined ? dto.appointmentLimit : this.appointmentLimit;
    this.timeBufferBefore = dto.timeBufferBefore !== undefined ? dto.timeBufferBefore : this.timeBufferBefore;
    this.timeBufferAfter = dto.timeBufferAfter !== undefined ? dto.timeBufferAfter : this.timeBufferAfter;
    this.oneEntityPerDay = dto.oneEntityPerDay !== undefined ? dto.oneEntityPerDay : this.oneEntityPerDay;
    this.entityTypeId = dto.entityTypeId !== undefined ? dto.entityTypeId : this.entityTypeId;
    this.productsSectionId = dto.productsSectionId !== undefined ? dto.productsSectionId : this.productsSectionId;

    return this;
  }

  static getAuthorizable(scheduleId: number): Authorizable {
    return new SimpleAuthorizable({ type: PermissionObjectType.Schedule, id: scheduleId });
  }
}
