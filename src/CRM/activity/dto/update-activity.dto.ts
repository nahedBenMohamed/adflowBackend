import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

import { UpdateBaseTaskDto } from '../../base-task';

export class UpdateActivityDto extends UpdateBaseTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  entityId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  activityTypeId?: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsArray()
  fileIds?: string[] | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  result?: string | null;
}
