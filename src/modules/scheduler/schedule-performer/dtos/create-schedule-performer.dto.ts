import { OmitType } from '@nestjs/swagger';
import { SchedulePerformerDto } from './schedule-performer.dto';

export class CreateSchedulePerformerDto extends OmitType(SchedulePerformerDto, ['id'] as const) {}
