import { PartialType } from '@nestjs/swagger';

import { CreateSchedulePerformerDto } from './create-schedule-performer.dto';

export class UpdateSchedulePerformerDto extends PartialType(CreateSchedulePerformerDto) {}
