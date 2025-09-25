import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { AutomationProcessType } from '../../common';

export class AutomationProcessDto {
  @ApiProperty({ description: 'Automation process ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Date of creation' })
  @IsString()
  createdAt: string;

  @ApiProperty({ description: 'User ID of the creator' })
  @IsNumber()
  createdBy: number;

  @ApiProperty({ description: 'Name of the process' })
  @IsString()
  name: string;

  @ApiProperty({ enum: AutomationProcessType, description: 'Type of the process' })
  @IsEnum(AutomationProcessType)
  type: AutomationProcessType;

  @ApiPropertyOptional({ description: 'Object ID associated the process', nullable: true })
  @IsOptional()
  @IsNumber()
  objectId?: number | null;

  @ApiProperty({ description: 'Readonly status of the process' })
  @IsBoolean()
  isReadonly: boolean;

  @ApiProperty({ description: 'Activity of the process' })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Content of the process in BPMN format', nullable: true })
  @IsOptional()
  @IsString()
  bpmnFile?: string | null;
}
