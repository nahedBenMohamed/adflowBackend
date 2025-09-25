import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { SectionView } from '../enums';

export class EntityTypeSectionDto {
  @ApiProperty({ description: 'Section name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: SectionView, description: 'Section view' })
  @IsEnum(SectionView)
  view: SectionView;

  @ApiProperty({ description: 'Section icon' })
  @IsString()
  icon: string;
}
