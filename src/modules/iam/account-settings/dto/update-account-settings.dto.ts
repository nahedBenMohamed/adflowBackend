import { OmitType, PartialType } from '@nestjs/swagger';
import { AccountSettingsDto } from './account-settings.dto';

export class UpdateAccountSettingsDto extends PartialType(OmitType(AccountSettingsDto, ['isBpmnEnable'] as const)) {}
