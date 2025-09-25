import { PickType } from '@nestjs/swagger';
import { ActivityTypeDto } from './activity-type.dto';

export class CreateActivityTypeDto extends PickType(ActivityTypeDto, ['name'] as const) {}
