import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ScenarioType } from '../enums';
import { VoximplantScenarioTaskDto } from '../dto';

@Entity()
export class VoximplantScenarioTask {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  scenarioType: ScenarioType;

  @Column({ nullable: true, default: false })
  createActivity: boolean | null;

  @Column({ nullable: true })
  activityTypeId: number | null;

  @Column({ nullable: true })
  activityText: string | null;

  @Column({ nullable: true })
  activityDuration: number | null;

  @Column({ nullable: true })
  activityOwnerId: number | null;

  @Column({ nullable: true, default: false })
  createTask: boolean | null;

  @Column({ nullable: true })
  taskTitle: string | null;

  @Column({ nullable: true })
  taskText: string | null;

  @Column({ nullable: true })
  taskDuration: number | null;

  @Column({ nullable: true })
  taskOwnerId: number | null;

  constructor(
    accountId: number,
    scenarioType: ScenarioType,
    createActivity: boolean | null,
    activityTypeId: number | null,
    activityText: string | null,
    activityDuration: number | null,
    activityOwnerId: number | null,
    createTask: boolean | null,
    taskTitle: string | null,
    taskText: string | null,
    taskDuration: number | null,
    taskOwnerId: number | null,
  ) {
    this.accountId = accountId;
    this.scenarioType = scenarioType;
    this.createActivity = createActivity;
    this.activityTypeId = activityTypeId;
    this.activityText = activityText;
    this.activityDuration = activityDuration;
    this.activityOwnerId = activityOwnerId;
    this.createTask = createTask;
    this.taskTitle = taskTitle;
    this.taskText = taskText;
    this.taskDuration = taskDuration;
    this.taskOwnerId = taskOwnerId;
  }

  public static fromDto(accountId: number, dto: VoximplantScenarioTaskDto): VoximplantScenarioTask {
    return new VoximplantScenarioTask(
      accountId,
      dto.scenarioType,
      dto.createActivity,
      dto.activityTypeId,
      dto.activityText,
      dto.activityDuration,
      dto.activityOwnerId,
      dto.createTask,
      dto.taskTitle,
      dto.taskText,
      dto.taskDuration,
      dto.taskOwnerId,
    );
  }

  public toDto(): VoximplantScenarioTaskDto {
    return new VoximplantScenarioTaskDto(
      this.scenarioType,
      this.createActivity,
      this.activityTypeId,
      this.activityText,
      this.activityDuration,
      this.activityOwnerId,
      this.createTask,
      this.taskTitle,
      this.taskText,
      this.taskDuration,
      this.taskOwnerId,
    );
  }
}
