import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { TutorialProductType } from '../../common';

export class TutorialItemProductDto {
  @ApiProperty({ enum: TutorialProductType, description: 'Related product type' })
  @IsEnum(TutorialProductType)
  type: TutorialProductType;

  @ApiPropertyOptional({ nullable: true, description: 'Related Object ID' })
  @IsOptional()
  @IsNumber()
  objectId?: number | null | undefined;

  constructor({ type, objectId }: TutorialItemProductDto) {
    this.type = type;
    this.objectId = objectId;
  }
}
