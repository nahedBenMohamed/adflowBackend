import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { CreateDepartmentSettingsDto } from '../../department-settings/dto';
import { DepartmentDto } from './department.dto';

export class CreateDepartmentDto extends PickType(DepartmentDto, ['name', 'parentId'] as const) {
  @ApiPropertyOptional({ description: 'Department settings', type: CreateDepartmentSettingsDto, nullable: true })
  @IsOptional()
  settings?: CreateDepartmentSettingsDto | null;
}
