import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { SchedulePerformerType } from '../enums';

export class SchedulePerformerDto {
  @ApiProperty({ description: 'Schedule performer ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ enum: SchedulePerformerType, description: 'Schedule performer type' })
  @IsEnum(SchedulePerformerType)
  type: SchedulePerformerType;

  @ApiProperty({ nullable: true, description: 'User ID if performer is User' })
  @IsOptional()
  @IsNumber()
  userId?: number | null;

  @ApiProperty({ nullable: true, description: 'Department ID if performer is Department' })
  @IsOptional()
  @IsNumber()
  departmentId?: number | null;
}
