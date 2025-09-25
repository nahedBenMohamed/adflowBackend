import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { FieldGroupCode } from '../enums';

export class FieldGroupDto {
  @ApiProperty({ description: 'Field group ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Field group name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Field group sort order' })
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ description: 'Entity type ID' })
  @IsNumber()
  entityTypeId: number;

  @ApiPropertyOptional({ enum: FieldGroupCode, nullable: true, description: 'Field group code' })
  @IsOptional()
  @IsEnum(FieldGroupCode)
  code?: FieldGroupCode | null;
}
