import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { FieldDto } from '@/modules/entity/entity-field/field/dto/field.dto';
import { FieldGroupDto } from '@/modules/entity/entity-field/field-group/dto/field-group.dto';

import { EntityCategory } from '../../common';
import { EntityTypeLinkDto } from '../../entity-type-link/dto';
import { FeatureCode } from '../../feature';

import { EntityTypeSectionDto } from './entity-type-section.dto';

export class EntityTypeDto {
  @ApiProperty({ description: 'Entity type ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Entity type name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: EntityCategory, description: 'Entity type category' })
  @IsEnum(EntityCategory)
  entityCategory: EntityCategory;

  @ApiProperty({ type: EntityTypeSectionDto, description: 'Entity type section info' })
  section: EntityTypeSectionDto;

  @ApiProperty({ type: [FieldGroupDto], description: 'Entity type field groups' })
  @IsArray()
  fieldGroups: FieldGroupDto[];

  @ApiProperty({ type: [FieldDto], description: 'Entity type fields' })
  @IsArray()
  fields: FieldDto[];

  @ApiProperty({ type: [EntityTypeLinkDto], description: 'Linked entity types' })
  @IsArray()
  linkedEntityTypes: EntityTypeLinkDto[];

  @ApiProperty({ enum: FeatureCode, isArray: true, description: 'Feature codes' })
  @IsArray()
  featureCodes: FeatureCode[];

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number | null;

  @ApiProperty({ description: 'Created at in ISO format' })
  @IsString()
  createdAt: string;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Linked products section IDs' })
  @IsOptional()
  @IsNumber({}, { each: true })
  linkedProductsSectionIds?: number[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, description: 'Linked scheduler IDs' })
  @IsOptional()
  @IsNumber({}, { each: true })
  linkedSchedulerIds?: number[] | null;

  constructor({
    id,
    name,
    entityCategory,
    section,
    fieldGroups,
    fields,
    linkedEntityTypes,
    featureCodes,
    sortOrder,
    createdAt,
    linkedProductsSectionIds,
    linkedSchedulerIds,
  }: EntityTypeDto) {
    this.id = id;
    this.name = name;
    this.entityCategory = entityCategory;
    this.section = section;
    this.fieldGroups = fieldGroups;
    this.fields = fields;
    this.linkedEntityTypes = linkedEntityTypes;
    this.featureCodes = featureCodes;
    this.sortOrder = sortOrder;
    this.createdAt = createdAt;
    this.linkedProductsSectionIds = linkedProductsSectionIds;
    this.linkedSchedulerIds = linkedSchedulerIds;
  }
}
