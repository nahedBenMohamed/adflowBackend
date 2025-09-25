import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional } from 'class-validator';

import { ActionHttpCallSettings } from '../../automation-http/dto';

import { EntityTypeActionType } from '../enums';
import {
  ActionActivityCreateSettings,
  ActionChatSendAmworkSettings,
  ActionChatSendSettings,
  ActionEmailSendSettings,
  ActionEntityCreateSettings,
  ActionEntityResponsibleChangeSettings,
  ActionEntityStageChangeSettings,
  ActionTaskCreateSettings,
} from './actions';

@ApiExtraModels(ActionActivityCreateSettings)
@ApiExtraModels(ActionChatSendAmworkSettings)
@ApiExtraModels(ActionChatSendSettings)
@ApiExtraModels(ActionEmailSendSettings)
@ApiExtraModels(ActionEntityCreateSettings)
@ApiExtraModels(ActionEntityResponsibleChangeSettings)
@ApiExtraModels(ActionEntityStageChangeSettings)
@ApiExtraModels(ActionHttpCallSettings)
@ApiExtraModels(ActionTaskCreateSettings)
export class EntityTypeAction {
  @ApiPropertyOptional({ description: 'Delay in seconds before executing the action', nullable: true })
  @IsOptional()
  @IsNumber()
  delay?: number | null;

  @ApiProperty({ description: 'Type of the action', enum: EntityTypeActionType })
  @IsEnum(EntityTypeActionType)
  type: EntityTypeActionType;

  @ApiProperty({
    description: 'Settings for the action',
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(ActionActivityCreateSettings) },
        { $ref: getSchemaPath(ActionChatSendAmworkSettings) },
        { $ref: getSchemaPath(ActionChatSendSettings) },
        { $ref: getSchemaPath(ActionEmailSendSettings) },
        { $ref: getSchemaPath(ActionEntityCreateSettings) },
        { $ref: getSchemaPath(ActionEntityResponsibleChangeSettings) },
        { $ref: getSchemaPath(ActionEntityStageChangeSettings) },
        { $ref: getSchemaPath(ActionHttpCallSettings) },
        { $ref: getSchemaPath(ActionTaskCreateSettings) },
      ],
    },
  })
  @IsObject()
  settings:
    | ActionActivityCreateSettings
    | ActionChatSendAmworkSettings
    | ActionChatSendSettings
    | ActionEmailSendSettings
    | ActionEntityCreateSettings
    | ActionEntityResponsibleChangeSettings
    | ActionEntityStageChangeSettings
    | ActionHttpCallSettings
    | ActionTaskCreateSettings;
}
