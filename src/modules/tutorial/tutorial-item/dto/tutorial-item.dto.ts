import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

import { TutorialItemProductDto } from './tutorial-item-product.dto';

export class TutorialItemDto {
  @ApiProperty({ description: 'Tutorial item ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Tutorial group ID' })
  @IsNumber()
  groupId: number;

  @ApiProperty({ description: 'Tutorial item name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tutorial item link' })
  @IsString()
  link: string;

  @ApiProperty({ description: 'Tutorial item sort order' })
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ description: 'Tutorial item creation date in ISO format' })
  @IsString()
  createdAt: string;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'User IDs associated with the tutorial item' })
  @IsOptional()
  @IsNumber({}, { each: true })
  userIds?: number[] | null;

  @ApiPropertyOptional({
    type: [TutorialItemProductDto],
    nullable: true,
    description: 'Products associated with the tutorial item',
  })
  @IsOptional()
  @IsArray()
  products?: TutorialItemProductDto[] | null;

  constructor({ id, groupId, name, link, sortOrder, createdAt, userIds, products }: TutorialItemDto) {
    this.id = id;
    this.groupId = groupId;
    this.name = name;
    this.link = link;
    this.sortOrder = sortOrder;
    this.createdAt = createdAt;
    this.userIds = userIds;
    this.products = products;
  }
}
