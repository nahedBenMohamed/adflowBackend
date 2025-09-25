import { Column, Entity } from 'typeorm';

import { DateUtil } from '@/common';

import { Authorizable, AuthorizableObject, SimpleAuthorizable } from '@/modules/iam/common';

import { PermissionObjectType } from '../../common';
import { BaseTask, TaskView } from '../../base-task';

import { CreateTaskDto, TaskDto, UpdateTaskDto } from '../dto';

@Entity('task')
export class Task extends BaseTask implements Authorizable {
  @Column({ nullable: true })
  entityId: number | null;

  @Column()
  title: string;

  @Column()
  plannedTime: number; // interval in seconds

  @Column()
  boardId: number;

  @Column()
  stageId: number;

  @Column()
  settingsId: number | null;

  @Column()
  externalId: string | null;

  constructor(
    accountId: number,
    entityId: number | null,
    createdBy: number,
    responsibleUserId: number,
    text: string,
    title: string,
    plannedTime: number | null,
    isResolved: boolean,
    startDate: Date,
    endDate: Date,
    resolvedDate: Date | null,
    weight: number,
    boardId: number,
    stageId: number,
    settingsId: number | null,
    externalId: string | null,
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
    this.title = title;
    this.plannedTime = plannedTime;
    this.boardId = boardId;
    this.stageId = stageId;
    this.settingsId = settingsId;
    this.externalId = externalId;
  }

  public static create(accountId: number, createdBy: number, dto: CreateTaskDto): Task {
    return new Task(
      accountId,
      dto.entityId,
      createdBy,
      dto.responsibleUserId,
      dto.text ?? '',
      dto.title,
      dto.plannedTime,
      false,
      dto.startDate ? DateUtil.fromISOString(dto.startDate) : null,
      dto.endDate ? DateUtil.fromISOString(dto.endDate) : null,
      dto.resolvedDate ? DateUtil.fromISOString(dto.resolvedDate) : null,
      dto.weight,
      dto.boardId,
      dto.stageId,
      dto.settingsId,
      dto.externalId,
    );
  }

  public update(dto: UpdateTaskDto): Task {
    this.entityId = dto.entityId !== undefined ? dto.entityId : this.entityId;
    this.responsibleUserId = dto.responsibleUserId !== undefined ? dto.responsibleUserId : this.responsibleUserId;
    this.text = dto.text !== undefined ? dto.text : this.text;
    this.title = dto.title !== undefined ? dto.title : this.title;
    this.plannedTime = dto.plannedTime !== undefined ? dto.plannedTime : this.plannedTime;
    this.startDate = dto.startDate !== undefined ? DateUtil.fromISOString(dto.startDate) : this.startDate;
    this.endDate = dto.endDate !== undefined ? DateUtil.fromISOString(dto.endDate) : this.endDate;
    this.boardId = dto.boardId ? dto.boardId : this.boardId;
    this.stageId = dto.stageId ? dto.stageId : this.stageId;
    this.externalId = dto.externalId !== undefined ? dto.externalId : this.externalId;

    if (dto.isResolved !== undefined) {
      if (!this.isResolved && dto.isResolved) this.resolvedDate = DateUtil.now();
      if (this.isResolved && !dto.isResolved) this.resolvedDate = null;
      this.isResolved = dto.isResolved;
    }

    return this;
  }

  public hasChanges(dto: UpdateTaskDto): boolean {
    return (
      (dto.entityId !== undefined && dto.entityId !== this.entityId) ||
      (dto.responsibleUserId !== undefined && dto.responsibleUserId !== this.responsibleUserId) ||
      (dto.text !== undefined && dto.text !== this.text) ||
      (dto.title !== undefined && dto.title !== this.title) ||
      (dto.plannedTime !== undefined && dto.plannedTime !== this.plannedTime) ||
      (dto.startDate !== undefined && DateUtil.fromISOString(dto.startDate) !== this.startDate) ||
      (dto.endDate !== undefined && DateUtil.fromISOString(dto.endDate) !== this.endDate) ||
      (dto.boardId !== undefined && dto.boardId !== this.boardId) ||
      (dto.stageId !== undefined && dto.stageId !== this.stageId) ||
      (dto.externalId !== undefined && dto.externalId !== this.externalId) ||
      (dto.isResolved !== undefined && dto.isResolved !== this.isResolved)
    );
  }

  public view(): TaskView {
    return TaskView.Task;
  }

  public toSimpleDto(): TaskDto {
    return new TaskDto(this, null, [], [], null);
  }

  getAuthorizableObject(): AuthorizableObject {
    return {
      type: PermissionObjectType.Task,
      id: null,
      ownerId: this.responsibleUserId,
      createdBy: this.createdBy,
    };
  }
  static getAuthorizable(): Authorizable {
    return new SimpleAuthorizable({ type: PermissionObjectType.Task, id: null });
  }
}
