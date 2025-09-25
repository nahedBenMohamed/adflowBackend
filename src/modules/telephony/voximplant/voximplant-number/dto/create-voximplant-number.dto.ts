import { PickType } from '@nestjs/swagger';

import { VoximplantNumberDto } from './voximplant-number.dto';

export class CreateVoximplantNumberDto extends PickType(VoximplantNumberDto, [
  'phoneNumber',
  'externalId',
  'userIds',
] as const) {}
