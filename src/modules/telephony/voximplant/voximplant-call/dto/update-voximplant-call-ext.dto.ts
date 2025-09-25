import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateVoximplantCallExtDto } from './create-voximplant-call-ext.dto';

export class UpdateVoximplantCallExtDto extends PartialType(
  OmitType(CreateVoximplantCallExtDto, ['sessionId', 'callId', 'viPhoneNumber', 'numberId'] as const),
) {}
