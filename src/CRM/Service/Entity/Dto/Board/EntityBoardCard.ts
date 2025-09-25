import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { EntityCategory } from '../../../../common';

import { CommonEntityCard } from './CommonEntityCard';
import { ProjectEntityCard } from './ProjectEntityCard';

export class EntityBoardCard {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ enum: EntityCategory })
  @IsEnum(EntityCategory)
  entityCategory: EntityCategory;

  @ApiProperty()
  @IsNumber()
  boardId: number;

  @ApiProperty()
  @IsNumber()
  stageId: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  price: number | null;

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

  @ApiProperty()
  data: CommonEntityCard | ProjectEntityCard;

  constructor({ id, entityCategory, boardId, stageId, price, weight, focused, closedAt, data }: EntityBoardCard) {
    this.id = id;
    this.entityCategory = entityCategory;
    this.boardId = boardId;
    this.stageId = stageId;
    this.price = price;
    this.weight = weight;
    this.focused = focused;
    this.closedAt = closedAt;
    this.data = data;
  }
}
