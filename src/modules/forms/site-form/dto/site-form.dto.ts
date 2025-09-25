import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { SiteFormConsentDto } from '../../site-form-consent';
import { SiteFormGratitudeDto } from '../../site-form-gratitude';
import { SiteFormPageDto } from '../../site-form-page';

import { SiteFormType } from '../enums';
import { SiteFormEntityTypeDto } from './site-form-entity-type.dto';
import { SiteFormScheduleDto } from './site-form-schedule.dto';

export class SiteFormDto {
  @ApiProperty({ description: 'Site form id' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'User ID who created form' })
  @IsNumber()
  createdBy: number;

  @ApiProperty({ enum: SiteFormType, description: 'Form type' })
  @IsEnum(SiteFormType)
  type: SiteFormType;

  @ApiProperty({ description: 'Form name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Form code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Is form active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Is form headless' })
  @IsBoolean()
  isHeadless: boolean;

  @ApiPropertyOptional({ nullable: true, description: 'Form title' })
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Form responsible user ID' })
  @IsOptional()
  @IsNumber()
  responsibleId?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Form design' })
  @IsOptional()
  @IsObject()
  design: object | null;

  @ApiPropertyOptional({ description: 'Is field label enabled' })
  @IsOptional()
  @IsBoolean()
  fieldLabelEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Is field placeholder enabled' })
  @IsOptional()
  @IsBoolean()
  fieldPlaceholderEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Is multiform enabled' })
  @IsOptional()
  @IsBoolean()
  multiformEnabled?: boolean;

  @ApiPropertyOptional({ nullable: true, description: 'Schedule limit for date choose' })
  @IsOptional()
  @IsNumber()
  scheduleLimitDays?: number | null;

  @ApiPropertyOptional({ description: 'Deduplicate linked cards by phone or email' })
  @IsOptional()
  @IsBoolean()
  checkDuplicate?: boolean;

  @ApiPropertyOptional({ type: SiteFormConsentDto, nullable: true, description: 'Form consent' })
  @IsOptional()
  @Type(() => SiteFormConsentDto)
  consent?: SiteFormConsentDto | null;

  @ApiPropertyOptional({ type: SiteFormGratitudeDto, nullable: true, description: 'Form gratitude' })
  @IsOptional()
  @Type(() => SiteFormGratitudeDto)
  gratitude?: SiteFormGratitudeDto | null;

  @ApiPropertyOptional({ type: [SiteFormPageDto], nullable: true, description: 'Form pages' })
  @IsOptional()
  @IsArray()
  @Type(() => SiteFormPageDto)
  pages?: SiteFormPageDto[] | null;

  @ApiPropertyOptional({ type: [SiteFormEntityTypeDto], nullable: true, description: 'Form entity type links' })
  @IsOptional()
  @IsArray()
  @Type(() => SiteFormEntityTypeDto)
  entityTypeLinks?: SiteFormEntityTypeDto[] | null;

  @ApiPropertyOptional({ type: [SiteFormScheduleDto], nullable: true, description: 'Form schedule links' })
  @IsOptional()
  @IsArray()
  @Type(() => SiteFormScheduleDto)
  scheduleLinks?: SiteFormScheduleDto[] | null;
}
