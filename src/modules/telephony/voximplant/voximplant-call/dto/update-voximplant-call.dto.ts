import { PartialType, PickType } from '@nestjs/swagger';
import { VoximplantCallDto } from './voximplant-call.dto';

export class UpdateVoximplantCallDto extends PartialType(
  PickType(VoximplantCallDto, [
    'entityId',
    'direction',
    'phoneNumber',
    'duration',
    'status',
    'failureReason',
    'recordUrl',
    'comment',
  ] as const),
) {}
