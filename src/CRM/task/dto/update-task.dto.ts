import { ApiExtraModels, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { UpdateBaseTaskDto } from '../../base-task';
import { CreateTaskSubtaskDto, UpdateTaskSubtaskDto } from '../../task-subtask/dto';

@ApiExtraModels(CreateTaskSubtaskDto)
@ApiExtraModels(UpdateTaskSubtaskDto)
export class UpdateTaskDto extends UpdateBaseTaskDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  entityId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  plannedTime?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  boardId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stageId?: number;

  @ApiPropertyOptional({ nullable: true, description: 'External ID' })
  @IsOptional()
  @IsString()
  externalId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsArray()
  fileIds?: string[] | null;

  @ApiPropertyOptional({
    description: 'Array of subtasks',
    type: 'array',
    items: { oneOf: [{ $ref: getSchemaPath(CreateTaskSubtaskDto) }, { $ref: getSchemaPath(UpdateTaskSubtaskDto) }] },
  })
  @IsOptional()
  @IsArray()
  @Type(() => Object) //HACK: Nest make items array not object?!?!
  subtasks?: (CreateTaskSubtaskDto | UpdateTaskSubtaskDto)[] | null;
}
