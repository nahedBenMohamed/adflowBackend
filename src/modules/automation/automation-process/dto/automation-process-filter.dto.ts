import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { AutomationProcessType } from '../../common';

export class AutomationProcessFilterDto {
  @ApiPropertyOptional({ description: 'User ID of the creator' })
  @IsOptional()
  @IsNumber()
  createdBy?: number;

  @ApiPropertyOptional({ description: 'Name of the process' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: AutomationProcessType, description: 'Type of the process' })
  @IsOptional()
  @IsEnum(AutomationProcessType)
  type?: AutomationProcessType;

  @ApiPropertyOptional({ description: 'Object ID associated the process' })
  @IsOptional()
  @IsNumber()
  objectId?: number;

  @ApiPropertyOptional({ description: 'Flag indicating whether the process is read-only' })
  @IsOptional()
  @IsString()
  isReadonly?: string;
}
