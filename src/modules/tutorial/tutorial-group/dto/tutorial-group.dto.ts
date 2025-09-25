import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

import { TutorialItemDto } from '../../tutorial-item';

export class TutorialGroupDto {
  @ApiProperty({ description: 'Tutorial group ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Tutorial group name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tutorial group sort order' })
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ description: 'Tutorial group creation date in ISO format' })
  @IsString()
  createdAt: string;

  @ApiProperty({ type: [TutorialItemDto], nullable: true, description: 'Tutorial group items' })
  @IsOptional()
  @IsArray()
  items: TutorialItemDto[] | null;

  constructor({ id, name, sortOrder, createdAt, items }: TutorialGroupDto) {
    this.id = id;
    this.name = name;
    this.sortOrder = sortOrder;
    this.createdAt = createdAt;
    this.items = items;
  }
}
