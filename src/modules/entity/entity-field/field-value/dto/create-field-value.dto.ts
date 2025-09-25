import { PickType } from '@nestjs/swagger';

import { FieldValueDto } from './field-value.dto';

export class CreateFieldValueDto extends PickType(FieldValueDto, ['fieldId', 'fieldType', 'payload'] as const) {}
