import { Column, Entity } from 'typeorm';

import { DateUtil } from '@/common';

import { Authorizable, AuthorizableObject, SimpleAuthorizable } from '@/modules/iam/common';

import { PermissionObjectType } from '../../common';
import { BaseTask, TaskView } from '../../base-task';
import { ActivityDto, CreateActivityDto, UpdateActivityDto } from '../dto';

@Entity('activity')
export class Activity extends BaseTask implements Authorizable {
  @Column()
  entityId: number;

  @Column()
  activityTypeId: number;

  @Column({ nullable: true })
  result?: string;

  constructor(
    accountId: number,
    entityId: number,
    createdBy: number,
    responsibleUserId: number,
    text: string,
    activityTypeId: number,
    isResolved: boolean,
    startDate: Date,
    endDate: Date,
    resolvedDate: Date | null,
    weight: number,
    result?: string,
    createdAt?: Date,
  ) {
    super(
      accountId,
      createdBy,
      responsibleUserId,
      text,
      isResolved,
      startDate,
      endDate,
      resolvedDate,
      weight,
      createdAt,
    );
    this.entityId = entityId;
    this.activityTypeId = activityTypeId;
    this.result = result;
  }

  public static create(accountId: number, createdBy: number, dto: CreateActivityDto): Activity {
    return new Activity(
      accountId,
      dto.entityId,
      createdBy,
      dto.responsibleUserId,
      dto.text,
      dto.activityTypeId,
      !!dto.isResolved,
      dto.startDate ? DateUtil.fromISOString(dto.startDate) : DateUtil.now(),
      dto.endDate ? DateUtil.fromISOString(dto.endDate) : DateUtil.now(),
      dto.resolvedDate ? DateUtil.fromISOString(dto.resolvedDate) : null,
      dto.weight,
      dto.result,
    );
  }

  public update(dto: UpdateActivityDto): Activity {
    this.entityId = dto.entityId !== undefined ? dto.entityId : this.entityId;
    this.responsibleUserId = dto.responsibleUserId !== undefined ? dto.responsibleUserId : this.responsibleUserId;
    this.text = dto.text !== undefined ? dto.text : this.text;
    this.activityTypeId = dto.activityTypeId !== undefined ? dto.activityTypeId : this.activityTypeId;
    this.result = dto.result !== undefined ? dto.result : this.result;
    this.startDate = dto.startDate !== undefined ? DateUtil.fromISOString(dto.startDate) : this.startDate;
    this.endDate = dto.endDate !== undefined ? DateUtil.fromISOString(dto.endDate) : this.endDate;
    if (dto.isResolved !== undefined) {
      if (!this.isResolved && dto.isResolved) this.resolvedDate = DateUtil.now();
      if (this.isResolved && !dto.isResolved) this.resolvedDate = null;
      this.isResolved = dto.isResolved;
    }
    return this;
  }

  public view(): TaskView {
    return TaskView.Activity;
  }

  public toSimpleDto(): ActivityDto {
    return new ActivityDto(this, null, [], null);
  }

  getAuthorizableObject(): AuthorizableObject {
    return {
      type: PermissionObjectType.Activity,
      id: null,
      ownerId: this.responsibleUserId,
      createdBy: this.createdBy,
    };
  }

  static getAuthorizable(): Authorizable {
    return new SimpleAuthorizable({ type: PermissionObjectType.Activity, id: null });
  }
}
