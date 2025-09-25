import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { ManualSorting } from '@/common';
import { UpdateFieldValueDto } from '@/modules/entity/entity-field/field-value/dto/update-field-value.dto';

import { EntityLinkDto } from '../../../entity-link/dto';

export class CreateEntityDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  responsibleUserId: number;

  @ApiProperty()
  @IsNumber()
  entityTypeId: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  boardId?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  stageId?: number | null;

  @ApiPropertyOptional({ type: [UpdateFieldValueDto] })
  fieldValues?: UpdateFieldValueDto[];

  @ApiPropertyOptional({ type: [EntityLinkDto] })
  entityLinks?: EntityLinkDto[];

  @ApiPropertyOptional({ type: ManualSorting })
  @IsOptional()
  sorting?: ManualSorting;

  closedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Is focused?' })
  @IsOptional()
  @IsBoolean()
  focused?: boolean;
}
