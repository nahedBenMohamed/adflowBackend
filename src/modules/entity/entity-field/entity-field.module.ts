import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { StorageModule } from '@/modules/storage/storage.module';

import { FieldGroup, FieldGroupService } from './field-group';
import { FieldOption, FieldOptionService } from './field-option';
import { FieldValue, FieldValueHandler, FieldValueService } from './field-value';
import { Field, FieldController, FieldService } from './field';

import { FieldStageSettings } from './field-settings/entities/field-stage-settings.entity';
import { FieldUserSettings } from './field-settings/entities/field-user-settings.entity';
import { FieldSettingsController } from './field-settings/field-settings.controller';
import { FieldSettingsService } from './field-settings/field-settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Field, FieldGroup, FieldOption, FieldValue, FieldStageSettings, FieldUserSettings]),
    IAMModule,
    StorageModule,
  ],
  controllers: [FieldController, FieldSettingsController],
  providers: [
    FieldService,
    FieldGroupService,
    FieldOptionService,
    FieldValueService,
    FieldValueHandler,
    FieldSettingsService,
  ],
  exports: [FieldService, FieldGroupService, FieldOptionService, FieldValueService, FieldSettingsService],
})
export class EntityFieldModule {}
