import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ProductsSectionEntityTypeDto {
  @ApiProperty()
  @IsNumber()
  sectionId: number;

  @ApiProperty()
  @IsNumber()
  entityTypeId: number;

  constructor(sectionId: number, entityTypeId: number) {
    this.sectionId = sectionId;
    this.entityTypeId = entityTypeId;
  }
}
