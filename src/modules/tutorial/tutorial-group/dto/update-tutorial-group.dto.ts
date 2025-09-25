import { PartialType, PickType } from '@nestjs/swagger';

import { TutorialGroupDto } from './tutorial-group.dto';

export class UpdateTutorialGroupDto extends PartialType(PickType(TutorialGroupDto, ['name', 'sortOrder'] as const)) {}
