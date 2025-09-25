import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { UpdateFieldGroupDto } from '@/modules/entity/entity-field/field-group/dto/update-field-group.dto';
import { UpdateFieldDto } from '@/modules/entity/entity-field/field/dto/update-field.dto';

export class UpdateEntityTypeFieldsDto {
  @ApiProperty({ type: [UpdateFieldGroupDto], description: 'Field groups' })
  @IsArray()
  fieldGroups: UpdateFieldGroupDto[];

  @ApiProperty({ type: [UpdateFieldDto], description: 'Fields' })
  @IsArray()
  fields: UpdateFieldDto[];
}
