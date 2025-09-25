import { PartialType, PickType } from '@nestjs/swagger';
import { DepartmentSettingsDto } from './department-settings.dto';

export class CreateDepartmentSettingsDto extends PartialType(
  PickType(DepartmentSettingsDto, ['workingDays', 'workingTimeFrom', 'workingTimeTo', 'timeZone'] as const),
) {}
