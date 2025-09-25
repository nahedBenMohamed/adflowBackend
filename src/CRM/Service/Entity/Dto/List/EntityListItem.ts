import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { UserRights } from '@/modules/iam/common/types/user-rights';
import { FieldValueDto } from '@/modules/entity/entity-field/field-value/dto/field-value.dto';

import { Entity } from '../../../../Model/Entity/Entity';

export class EntityListItem {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  responsibleUserId: number;

  @ApiProperty()
  @IsNumber()
  entityTypeId: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  boardId: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  stageId: number | null;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiProperty()
  @IsNumber()
  weight: number;

  @ApiPropertyOptional({ description: 'Is focused?' })
  @IsOptional()
  @IsBoolean()
  focused: boolean;

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

  @ApiProperty({ type: [FieldValueDto] })
  fieldValues: FieldValueDto[];

  @ApiProperty({ type: () => UserRights })
  userRights: UserRights;

  constructor({
    id,
    name,
    createdAt,
    responsibleUserId,
    entityTypeId,
    boardId,
    stageId,
    weight,
    focused,
    closedAt,
    copiedFrom,
    copiedCount,
    fieldValues,
    userRights,
  }: EntityListItem) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.responsibleUserId = responsibleUserId;
    this.entityTypeId = entityTypeId;
    this.boardId = boardId;
    this.stageId = stageId;
    this.weight = weight;
    this.focused = focused;
    this.closedAt = closedAt;
    this.copiedFrom = copiedFrom;
    this.copiedCount = copiedCount;
    this.fieldValues = fieldValues;
    this.userRights = userRights;
  }

  static create(entity: Entity, fieldValues: FieldValueDto[], userRights: UserRights) {
    return new EntityListItem({
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt.toISOString(),
      responsibleUserId: entity.responsibleUserId,
      entityTypeId: entity.entityTypeId,
      boardId: entity.boardId,
      stageId: entity.stageId,
      weight: entity.weight,
      focused: entity.focused,
      closedAt: entity.closedAt?.toISOString(),
      copiedFrom: entity.copiedFrom,
      copiedCount: entity.copiedCount,
      fieldValues,
      userRights,
    });
  }
}
