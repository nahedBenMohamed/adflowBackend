import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { CreateBaseTaskDto } from '../../base-task';

export class CreateActivityDto extends CreateBaseTaskDto {
  @ApiProperty()
  @IsNumber()
  entityId: number;

  @ApiProperty()
  @IsNumber()
  activityTypeId: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  fileIds?: string[] | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  result?: string | null;
}
