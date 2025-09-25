import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { InventoryModule } from '@/modules/inventory/inventory.module';
import { EntityFieldModule } from '@/modules/entity/entity-field/entity-field.module';
import { CrmModule } from '@/CRM/crm.module';

import documentsConfig from './config/documents.config';
import {
  DocumentTemplate,
  DocumentTemplateAccess,
  DocumentTemplateEntityType,
  DocumentTemplateController,
  DocumentTemplateService,
} from './document-template';
import { DocumentGenerationController, DocumentGenerationService } from './document-generation';

@Module({
  imports: [
    ConfigModule.forFeature(documentsConfig),
    TypeOrmModule.forFeature([DocumentTemplate, DocumentTemplateAccess, DocumentTemplateEntityType]),
    IAMModule,
    StorageModule,
    EntityFieldModule,
    forwardRef(() => CrmModule),
    forwardRef(() => InventoryModule),
  ],
  controllers: [DocumentTemplateController, DocumentGenerationController],
  providers: [DocumentTemplateService, DocumentGenerationService],
  exports: [DocumentGenerationService],
})
export class DocumentsModule {}
