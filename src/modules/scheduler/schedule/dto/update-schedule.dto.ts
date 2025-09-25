import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

import { ScheduleDto } from './schedule.dto';
import { CreateSchedulePerformerDto } from '../../schedule-performer';

export class UpdateScheduleDto extends PartialType(OmitType(ScheduleDto, ['id', 'createdAt', 'performers'] as const)) {
  @ApiPropertyOptional({
    type: [CreateSchedulePerformerDto],
    nullable: true,
    description: 'Available performers for schedule',
  })
  @IsOptional()
  @IsArray()
  performers?: CreateSchedulePerformerDto[] | null;
}
