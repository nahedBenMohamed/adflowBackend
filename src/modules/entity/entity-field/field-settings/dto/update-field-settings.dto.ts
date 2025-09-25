import { OmitType, PartialType } from '@nestjs/swagger';

import { FieldSettingsDto } from './field-settings.dto';

export class UpdateFieldSettingsDto extends PartialType(OmitType(FieldSettingsDto, ['fieldId'] as const)) {}
