import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

import { UpdateFieldGroupDto } from '@/modules/entity/entity-field/field-group/dto/update-field-group.dto';
import { FieldsSettingsDto } from '@/modules/entity/entity-field/field/dto/fields-settings.dto';
import { CreateFieldDto } from '@/modules/entity/entity-field/field/dto/create-field.dto';

import { EntityCategory } from '../../common';
import { CreateEntityTypeLinkDto } from '../../entity-type-link/dto';
import { FeatureCode } from '../../feature';
import { TaskFieldCode } from '../../task-settings/enums/task-field-code.enum';

import { EntityTypeSectionDto } from './entity-type-section.dto';

export class CreateEntityTypeDto {
  @ApiProperty({ description: 'Entity type name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: EntityCategory, description: 'Entity type category' })
  @IsEnum(EntityCategory)
  entityCategory: EntityCategory;

  @ApiProperty({ type: EntityTypeSectionDto, description: 'Entity type section info' })
  @IsObject()
  section: EntityTypeSectionDto;

  @ApiProperty({ type: [UpdateFieldGroupDto], description: 'Entity type field groups' })
  @IsArray()
  fieldGroups: UpdateFieldGroupDto[];

  @ApiProperty({ type: [CreateFieldDto], description: 'Entity type fields' })
  @IsArray()
  fields: CreateFieldDto[];

  @ApiProperty({ type: [CreateEntityTypeLinkDto], description: 'Linked entity types' })
  @IsArray()
  linkedEntityTypes: CreateEntityTypeLinkDto[];

  @ApiProperty({ enum: FeatureCode, isArray: true, description: 'Feature codes' })
  @IsArray()
  featureCodes: FeatureCode[];

  @ApiPropertyOptional({ enum: TaskFieldCode, isArray: true, description: 'Task settings active fields' })
  @IsOptional()
  @IsArray()
  taskSettingsActiveFields: TaskFieldCode[];

  @ApiPropertyOptional({ type: FieldsSettingsDto, description: 'Fields settings' })
  @IsOptional()
  @IsObject()
  fieldsSettings?: FieldsSettingsDto;

  @ApiPropertyOptional({ required: false, nullable: true, description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Linked products section IDs' })
  @IsOptional()
  @IsNumber({}, { each: true })
  linkedProductsSectionIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Linked scheduler IDs' })
  @IsOptional()
  @IsNumber({}, { each: true })
  linkedSchedulerIds?: number[] | null;
}
