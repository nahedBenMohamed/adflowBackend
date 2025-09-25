import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { UserRights } from '@/modules/iam/common/types/user-rights';

import { Entity } from '../../../../Model/Entity/Entity';
import { TasksCount } from './TasksCount';

export class ProjectEntityCard {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  entityTypeId: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  ownerId: number;

  @ApiProperty({ type: [Number] })
  @IsNumber({}, { each: true })
  participantIds: number[];

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  startDate: string | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  endDate: string | null;

  @ApiProperty({ type: TasksCount })
  tasksCount: TasksCount;

  @ApiProperty({ type: () => UserRights })
  userRights: UserRights;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiProperty()
  @IsNumber()
  weight: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  closedAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  copiedFrom?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  copiedCount?: number | null;

  constructor({
    id,
    entityTypeId,
    name,
    ownerId,
    participantIds,
    startDate,
    endDate,
    tasksCount,
    userRights,
    createdAt,
    weight,
    closedAt,
    copiedFrom,
    copiedCount,
  }: ProjectEntityCard) {
    this.id = id;
    this.entityTypeId = entityTypeId;
    this.name = name;
    this.ownerId = ownerId;
    this.participantIds = participantIds;
    this.startDate = startDate;
    this.endDate = endDate;
    this.tasksCount = tasksCount;
    this.userRights = userRights;
    this.createdAt = createdAt;
    this.weight = weight;
    this.closedAt = closedAt;
    this.copiedFrom = copiedFrom;
    this.copiedCount = copiedCount;
  }

  public static create(
    entity: Entity,
    startDate: string | null,
    endDate: string | null,
    tasksCount: TasksCount,
    userRights: UserRights,
  ): ProjectEntityCard {
    return new ProjectEntityCard({
      id: entity.id,
      entityTypeId: entity.entityTypeId,
      name: entity.name,
      ownerId: entity.responsibleUserId,
      participantIds: entity.participantIds ?? [],
      startDate,
      endDate,
      tasksCount,
      userRights,
      createdAt: entity.createdAt.toISOString(),
      weight: entity.weight,
      closedAt: entity.closedAt?.toISOString(),
      copiedFrom: entity.copiedFrom,
      copiedCount: entity.copiedCount,
    });
  }
}
