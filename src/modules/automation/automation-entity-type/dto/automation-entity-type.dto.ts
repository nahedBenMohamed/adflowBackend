import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { EntityTypeTrigger } from '../enums';
import { EntityTypeCondition } from './entity-type-condition.dto';
import { EntityTypeAction } from './entity-type-action.dto';

export class AutomationEntityTypeDto {
  @ApiProperty({ description: 'EntityType automation ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Date of creation' })
  @IsString()
  createdAt: string;

  @ApiProperty({ description: 'User ID who created the automation' })
  @IsNumber()
  createdBy: number;

  @ApiProperty({ description: 'Name of the automation' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'EntityType ID', nullable: true })
  @IsNumber()
  entityTypeId: number | null;

  @ApiPropertyOptional({ description: 'Board ID', nullable: true })
  @IsOptional()
  @IsNumber()
  boardId?: number | null;

  @ApiPropertyOptional({ description: 'Stage ID', nullable: true })
  @IsOptional()
  @IsNumber()
  stageId?: number | null;

  @ApiProperty({ description: 'Is the automation active?' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Triggers for the automation', enum: EntityTypeTrigger, isArray: true })
  @IsArray()
  triggers: EntityTypeTrigger[];

  @ApiPropertyOptional({ description: 'Conditions for the automation', type: EntityTypeCondition, nullable: true })
  @IsOptional()
  @IsObject()
  conditions?: EntityTypeCondition | null;

  @ApiPropertyOptional({ description: 'Actions for the automation', type: [EntityTypeAction], nullable: true })
  @IsOptional()
  @IsArray()
  @Type(() => EntityTypeAction)
  actions?: EntityTypeAction[] | null;

  constructor({
    id,
    createdAt,
    createdBy,
    name,
    entityTypeId,
    boardId,
    stageId,
    isActive,
    triggers,
    conditions,
    actions,
  }: AutomationEntityTypeDto) {
    this.id = id;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.name = name;
    this.entityTypeId = entityTypeId;
    this.boardId = boardId;
    this.stageId = stageId;
    this.isActive = isActive;
    this.triggers = triggers;
    this.conditions = conditions;
    this.actions = actions;
  }
}
