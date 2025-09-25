import { OmitType, PartialType } from '@nestjs/swagger';
import { AccountSettingsDto } from './account-settings.dto';

export class CreateAccountSettingsDto extends PartialType(OmitType(AccountSettingsDto, ['isBpmnEnable'] as const)) {}
