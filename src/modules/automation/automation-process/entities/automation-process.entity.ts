import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';
import { AutomationProcessType } from '../../common';
import { AutomationProcessDto, type CreateAutomationProcessDto, type UpdateAutomationProcessDto } from '../dto';
import { ReadonlyProcess } from '../types';

interface ExternalIdentifiers {
  resourceKey?: string | null;
  bpmnProcessId?: string | null;
}

@Entity()
export class AutomationProcess {
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

  @Column()
  type: AutomationProcessType;

  @Column({ nullable: true })
  objectId: number | null;

  @Column({ default: false })
  isReadonly: boolean;

  @Column({ nullable: true, default: null })
  resourceKey: string | null;

  @Column({ nullable: true, default: null })
  bpmnProcessId: string | null;

  @Column({ nullable: true, select: false })
  bpmnFile: string | null;

  constructor(
    accountId: number,
    createdBy: number,
    name: string,
    type: AutomationProcessType,
    objectId: number | null,
    isReadonly: boolean,
    resourceKey: string | null,
    bpmnProcessId: string | null,
    bpmnFile: string | null,
  ) {
    this.accountId = accountId;
    this.createdAt = DateUtil.now();
    this.createdBy = createdBy;
    this.name = name;
    this.type = type;
    this.objectId = objectId;
    this.isReadonly = isReadonly;
    this.resourceKey = resourceKey;
    this.bpmnProcessId = bpmnProcessId;
    this.bpmnFile = bpmnFile;
  }

  public get isActive(): boolean {
    return !!this.resourceKey && !!this.bpmnProcessId;
  }

  public static fromDto({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: CreateAutomationProcessDto & ExternalIdentifiers & ReadonlyProcess;
  }): AutomationProcess {
    return new AutomationProcess(
      accountId,
      userId,
      dto.name,
      dto.type,
      dto.objectId,
      dto.isReadonly,
      dto.resourceKey,
      dto.bpmnProcessId,
      dto.bpmnFile,
    );
  }

  public update(dto: UpdateAutomationProcessDto & ExternalIdentifiers & ReadonlyProcess): AutomationProcess {
    this.name = dto.name !== undefined ? dto.name : this.name;
    this.type = dto.type !== undefined ? dto.type : this.type;
    this.objectId = dto.objectId !== undefined ? dto.objectId : this.objectId;
    this.isReadonly = dto.isReadonly !== undefined ? dto.isReadonly : this.isReadonly;
    this.resourceKey = dto.resourceKey !== undefined ? dto.resourceKey : this.resourceKey;
    this.bpmnProcessId = dto.bpmnProcessId !== undefined ? dto.bpmnProcessId : this.bpmnProcessId;
    this.bpmnFile = dto.bpmnFile !== undefined ? dto.bpmnFile : this.bpmnFile;

    return this;
  }

  public toDto(): AutomationProcessDto {
    return {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
      createdBy: this.createdBy,
      name: this.name,
      type: this.type,
      objectId: this.objectId,
      isReadonly: this.isReadonly,
      isActive: this.isActive,
      bpmnFile: this.bpmnFile,
    };
  }
}
