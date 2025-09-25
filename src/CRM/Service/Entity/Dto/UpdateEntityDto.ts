import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { ManualSorting } from '@/common';
import { UpdateFieldValueDto } from '@/modules/entity/entity-field/field-value/dto/update-field-value.dto';
import { EntityLinkDto } from '../../../entity-link/dto';

export class UpdateEntityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  responsibleUserId?: number;

  @ApiPropertyOptional({ type: [UpdateFieldValueDto] })
  @IsOptional()
  @IsArray()
  fieldValues?: UpdateFieldValueDto[];

  @ApiPropertyOptional({ type: [EntityLinkDto] })
  @IsOptional()
  @IsArray()
  entityLinks?: EntityLinkDto[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  boardId?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  stageId?: number | null;

  @ApiPropertyOptional({ type: ManualSorting })
  @IsOptional()
  sorting?: ManualSorting;

  closedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Is focused?' })
  @IsOptional()
  @IsBoolean()
  focused?: boolean;
}
