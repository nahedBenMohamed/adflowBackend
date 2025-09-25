import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { UserRights } from '@/modules/iam/common/types/user-rights';

import { Entity } from '../../../../Model/Entity/Entity';

export class CommonEntityCard {
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
  userId: number;

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

  @ApiProperty({ type: [String] })
  linkedEntityNames: string[];

  @ApiProperty()
  @IsString()
  taskIndicatorColor: string;

  @ApiProperty({ type: () => UserRights })
  userRights: UserRights;

  constructor({
    id,
    entityTypeId,
    name,
    createdAt,
    userId,
    weight,
    closedAt,
    copiedFrom,
    copiedCount,
    linkedEntityNames,
    taskIndicatorColor,
    userRights,
  }: CommonEntityCard) {
    this.id = id;
    this.entityTypeId = entityTypeId;
    this.name = name;
    this.createdAt = createdAt;
    this.userId = userId;
    this.weight = weight;
    this.closedAt = closedAt;
    this.copiedFrom = copiedFrom;
    this.copiedCount = copiedCount;
    this.linkedEntityNames = linkedEntityNames;
    this.taskIndicatorColor = taskIndicatorColor;
    this.userRights = userRights;
  }

  public static create(
    entity: Entity,
    linkedEntityNames: string[],
    taskIndicatorColor: string,
    userRights: UserRights,
  ) {
    return new CommonEntityCard({
      id: entity.id,
      entityTypeId: entity.entityTypeId,
      name: entity.name,
      createdAt: entity.createdAt.toISOString(),
      userId: entity.responsibleUserId,
      weight: entity.weight,
      closedAt: entity.closedAt?.toISOString(),
      copiedFrom: entity.copiedFrom,
      copiedCount: entity.copiedCount,
      linkedEntityNames,
      taskIndicatorColor,
      userRights,
    });
  }
}
