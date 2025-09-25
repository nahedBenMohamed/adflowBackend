import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { ScenarioType } from '../enums';

export class VoximplantScenarioTaskDto {
  @ApiProperty({ enum: ScenarioType })
  @IsEnum(ScenarioType)
  scenarioType: ScenarioType;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsBoolean()
  createActivity: boolean | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  activityTypeId: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  activityText: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  activityDuration: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  activityOwnerId: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsBoolean()
  createTask: boolean | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  taskTitle: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  taskText: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  taskDuration: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  taskOwnerId: number | null;

  constructor(
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
}
