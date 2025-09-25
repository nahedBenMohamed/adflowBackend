import { PickType } from '@nestjs/swagger';

import { VoximplantCallDto } from './voximplant-call.dto';

export class CreateVoximplantCallDto extends PickType(VoximplantCallDto, [
  'sessionId',
  'callId',
  'numberId',
  'entityId',
  'direction',
  'phoneNumber',
  'duration',
  'status',
  'failureReason',
  'recordUrl',
] as const) {}
