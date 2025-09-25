import { PickType } from '@nestjs/swagger';

import { TutorialItemDto } from './tutorial-item.dto';

export class CreateTutorialItemDto extends PickType(TutorialItemDto, [
  'name',
  'link',
  'sortOrder',
  'userIds',
  'products',
] as const) {}
