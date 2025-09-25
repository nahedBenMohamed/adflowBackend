import { PartialType } from '@nestjs/swagger';

import { CreateVoximplantSIPDto } from './create-voximplant-sip.dto';

export class UpdateVoximplantSIPDto extends PartialType(CreateVoximplantSIPDto) {}
