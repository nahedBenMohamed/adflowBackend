import { PartialType, PickType } from '@nestjs/swagger';

import { TutorialItemDto } from './tutorial-item.dto';

export class UpdateTutorialItemDto extends PartialType(
  PickType(TutorialItemDto, ['name', 'link', 'sortOrder', 'userIds', 'products'] as const),
) {}
