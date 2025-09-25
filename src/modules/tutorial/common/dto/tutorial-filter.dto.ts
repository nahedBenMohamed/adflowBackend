import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { TutorialProductType } from '../enums';

export class TutorialFilterDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ enum: TutorialProductType, description: 'Product type' })
  @IsOptional()
  @IsEnum(TutorialProductType)
  productType?: TutorialProductType;

  @ApiPropertyOptional({ description: 'Related object ID' })
  @IsOptional()
  @IsNumber()
  objectId?: number;
}
