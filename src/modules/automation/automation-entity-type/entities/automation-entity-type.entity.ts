import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { type EntityTypeTrigger } from '../enums';
import {
  CreateAutomationEntityTypeDto,
  UpdateAutomationEntityTypeDto,
  AutomationEntityTypeDto,
  EntityTypeCondition,
  EntityTypeAction,
} from '../dto';

@Entity()
export class AutomationEntityType {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column({ type: Date })
  createdAt: Date;

  @Column()
  createdBy: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  entityTypeId: number | null;

  @Column({ nullable: true })
  boardId: number | null;

  @Column({ nullable: true })
  stageId: number | null;

  @Column({ nullable: true })
  processId: number | null;

  @Column({ type: 'simple-array' })
  triggers: EntityTypeTrigger[];

  @Column({ type: 'jsonb', nullable: true })
  conditions: EntityTypeCondition | null;

  @Column({ type: 'jsonb', nullable: true })
  actions: EntityTypeAction[] | null;

  constructor(
    accountId: number,
    createdBy: number,
    name: string,
    entityTypeId: number | null,
    boardId: number | null,
    stageId: number | null,
    processId: number | null,
    triggers: EntityTypeTrigger[],
    conditions: EntityTypeCondition | null,
    actions: EntityTypeAction[] | null,
  ) {
    this.accountId = accountId;
    this.createdBy = createdBy;
    this.name = name;
    this.entityTypeId = entityTypeId;
    this.boardId = boardId;
    this.stageId = stageId;
    this.processId = processId;
    this.triggers = triggers;
    this.conditions = conditions;
    this.actions = actions;
    this.createdAt = DateUtil.now();
  }

  public get isActive(): boolean {
    return !!this.processId;
  }

  public static fromDto(
    accountId: number,
    createdBy: number,
    dto: CreateAutomationEntityTypeDto,
  ): AutomationEntityType {
    return new AutomationEntityType(
      accountId,
      createdBy,
      dto.name,
      dto.entityTypeId,
      dto.boardId,
      dto.stageId,
      null,
      dto.triggers,
      dto.conditions,
      dto.actions,
    );
  }

  public update(dto: UpdateAutomationEntityTypeDto & { processId?: number | null }): AutomationEntityType {
    this.name = dto.name !== undefined ? dto.name : this.name;
    this.entityTypeId = dto.entityTypeId !== undefined ? dto.entityTypeId : this.entityTypeId;
    this.boardId = dto.boardId !== undefined ? dto.boardId : this.boardId;
    this.stageId = dto.stageId !== undefined ? dto.stageId : this.stageId;
    this.processId = dto.processId !== undefined ? dto.processId : this.processId;
    this.triggers = dto.triggers !== undefined ? dto.triggers : this.triggers;
    this.conditions = dto.conditions !== undefined ? dto.conditions : this.conditions;
    this.actions = dto.actions !== undefined ? dto.actions : this.actions;

    return this;
  }

  public toDto(): AutomationEntityTypeDto {
    return new AutomationEntityTypeDto({
      ...this,
      createdAt: this.createdAt.toISOString(),
      isActive: this.isActive,
    });
  }
}
