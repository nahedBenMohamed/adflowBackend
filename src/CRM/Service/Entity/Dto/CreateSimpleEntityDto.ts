import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { SimpleFieldValueDto } from '@/modules/entity/entity-field/field-value/dto/simple-field-value.dto';

type LinkedEntity = CreateSimpleEntityDto | number;

export class CreateSimpleEntityDto {
  @ApiProperty()
  @IsNumber()
  entityTypeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  ownerId?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  boardId?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  stageId?: number | null;

  @ApiPropertyOptional({ description: 'Is focused?' })
  @IsOptional()
  @IsBoolean()
  focused?: boolean;

  @ApiPropertyOptional({ nullable: true, type: [SimpleFieldValueDto] })
  @IsOptional()
  @IsArray()
  fieldValues?: SimpleFieldValueDto[] | null;

  @ApiPropertyOptional({
    nullable: true,
    type: 'array',
    items: { oneOf: [{ $ref: getSchemaPath(CreateSimpleEntityDto) }, { type: 'number' }] },
  })
  @IsOptional()
  @IsArray()
  linkedEntities?: LinkedEntity[] | null;
}
