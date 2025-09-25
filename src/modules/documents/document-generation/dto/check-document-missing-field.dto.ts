import { ApiProperty } from '@nestjs/swagger';

import { FieldDto } from '@/modules/entity/entity-field/field/dto/field.dto';

export class CheckDocumentMissingFieldDto {
  @ApiProperty()
  entityTypeId: number;

  @ApiProperty({ type: FieldDto })
  field: FieldDto;

  constructor({ entityTypeId, field }: CheckDocumentMissingFieldDto) {
    this.entityTypeId = entityTypeId;
    this.field = field;
  }
}
