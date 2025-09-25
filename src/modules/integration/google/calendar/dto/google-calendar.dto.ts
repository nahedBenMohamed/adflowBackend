import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { CalendarType } from '../enums';
import { GoogleCalendarLinkedDto } from './google-calendar-linked.dto';

export class GoogleCalendarDto {
  @ApiProperty({ description: 'Calendar ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Created by user ID' })
  @IsNumber()
  createdBy: number;

  @ApiProperty({ description: 'Created at' })
  @IsString()
  createdAt: string;

  @ApiProperty({ description: 'External calendar ID' })
  @IsString()
  externalId: string;

  @ApiProperty({ description: 'Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Readonly' })
  @IsBoolean()
  readonly: boolean;

  @ApiProperty({ enum: CalendarType, description: 'Linked object type' })
  @IsEnum(CalendarType)
  type: CalendarType;

  @ApiProperty({ description: 'Linked object ID' })
  @IsNumber()
  objectId: number;

  @ApiProperty({ description: 'Default responsible ID' })
  @IsNumber()
  responsibleId: number;

  @ApiProperty({ description: 'Process all events' })
  @IsOptional()
  @IsBoolean()
  processAll?: boolean | null;

  @ApiPropertyOptional({ type: [GoogleCalendarLinkedDto], nullable: true, description: 'Secondary linked objects' })
  @IsOptional()
  linked?: GoogleCalendarLinkedDto[] | null;
}
