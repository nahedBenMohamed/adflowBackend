import { PickType } from '@nestjs/swagger';

import { TutorialGroupDto } from './tutorial-group.dto';

export class CreateTutorialGroupDto extends PickType(TutorialGroupDto, ['name', 'sortOrder'] as const) {}
