import { PartialType, PickType } from '@nestjs/swagger';

import { VoximplantNumberDto } from './voximplant-number.dto';

export class UpdateVoximplantNumberDto extends PartialType(
  PickType(VoximplantNumberDto, ['phoneNumber', 'externalId', 'userIds'] as const),
) {}
