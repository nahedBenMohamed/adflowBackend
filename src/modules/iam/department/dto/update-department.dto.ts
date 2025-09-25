import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { UpdateDepartmentSettingsDto } from '../../department-settings/dto';
import { DepartmentDto } from './department.dto';

export class UpdateDepartmentDto extends PartialType(PickType(DepartmentDto, ['name', 'isActive'] as const)) {
  @ApiPropertyOptional({ description: 'Department settings', type: UpdateDepartmentSettingsDto, nullable: true })
  @IsOptional()
  settings?: UpdateDepartmentSettingsDto | null;
}
