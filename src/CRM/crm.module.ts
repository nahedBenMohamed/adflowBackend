import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { InventoryModule } from '@/modules/inventory/inventory.module';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';
import { TelephonyModule } from '@/modules/telephony/telephony.module';
import { MultichatModule } from '@/modules/multichat/multichat.module';
import { EntityInfoModule } from '@/modules/entity/entity-info/entity-info.module';
import { EntityFieldModule } from '@/modules/entity/entity-field/entity-field.module';

import { MailingModule } from '@/Mailing/MailingModule';

import { CrmReportingModule } from './reporting/crm-reporting.module';
import { SalesPlanModule } from './sales-plan/sales-plan.module';
import { TaskSettingsModule } from './task-settings/task-settings.module';
import { SalesforceModule } from './Salesforce/SalesforceModule';

/// Entity
import { Entity } from './Model/Entity/Entity';
import { EntityService } from './Service/Entity/EntityService';
import { EntityServiceEmitter } from './Service/Entity/entity-service.emitter';
import { EntityServiceHandler } from './Service/Entity/entity-service.handler';
import { EntityBoardService } from './Service/Entity/EntityBoardService';
import { CreateEntityController } from './Controller/Entity/CreateEntityController';
import { CreateSimpleEntityController } from './Controller/Entity/CreateSimpleEntityController';
import { UpdateEntityController } from './Controller/Entity/UpdateEntityController';
import { UpdateEntityFieldController } from './Controller/Entity/UpdateEntityFieldController';
import { GetEntityController } from './Controller/Entity/GetEntityController';
import { GetEntityFilesController } from './Controller/Entity/Files/GetEntityFilesController';
import { AddEntityFilesController } from './Controller/Entity/Files/AddEntityFilesController';
import { GetTimeBoardController } from './Controller/TimeBoard/GetTimeBoardController';
import { GetTimeBoardMetaController } from './Controller/TimeBoard/GetTimeBoardMetaController';
import { GetTimeBoardCalendarController } from './Controller/TimeBoard/GetTimeBoardCalendarController';
import { GetTimeBoardCalendarMetaController } from './Controller/TimeBoard/GetTimeBoardCalendarMetaController';
import { GetTimeBoardItemController } from './Controller/TimeBoard/GetTimeBoardItemController';
import { TimeBoardService } from './Service/TimeBoard/TimeBoardService';
import { DeleteEntityController } from './Controller/Entity/DeleteEntityController';
import { ExternalEntity } from './Model/ExternalEntity/ExternalEntity';
import { ExternalEntityService } from './Service/ExternalEntity/ExternalEntityService';
import { CreateExternalLinkController } from './Controller/ExternalEntity/CreateExternalLinkController';
import { ExternalSystem } from './Model/ExternalEntity/ExternalSystem';
import { ExternalSystemService } from './Service/ExternalEntity/ExternalSystemService';
import { FileLink } from './Model/FileLink/FileLink';
import { FileLinkService } from './Service/FileLink/FileLinkService';
import { DeleteFileLinkController } from './Controller/FileLink/DeleteFileLinkController';
import { ProjectEntityBoardCardService } from './Service/Entity/ProjectEntityBoardCardService';
import { CommonEntityBoardCardService } from './Service/Entity/CommonEntityBoardCardService';
import { ImportService } from './Service/Import/ImportService';
import { GetEntitiesImportTemplateController } from './Controller/Entity/Import/GetEntitiesImportTemplateController';
import { UploadEntitiesImportController } from './Controller/Entity/Import/UploadEntitiesImportController';
import { GetEntityDocumentsController } from './Controller/Entity/Documents/GetEntityDocumentsController';
import { DeleteFileLinksController } from './Controller/FileLink/DeleteFileLinksController';
import { EntityBoardController } from './Controller/Entity/Board/entity-board.controller';
import { EntityListController } from './Controller/Entity/List/entity-list.controller';

import { Activity, ActivityController, ActivityHandler, ActivityService } from './activity';
import { ActivityCardController, ActivityCardService } from './activity-card';
import { ActivityType, ActivityTypeController, ActivityTypeService } from './activity-type';
import { BaseTaskService } from './base-task';
import { Board } from './board/entities';
import { BoardController } from './board/board.controller';
import { BoardService } from './board/board.service';
import { BoardHandler } from './board/board.handler';
import { BoardStage, BoardStageController, BoardStageService } from './board-stage';
import { EntityLink } from './entity-link/entities';
import { EntityLinkService } from './entity-link/entity-link.service';
import { EntitySearchController, EntitySearchService } from './entity-search';
import { EntityType } from './entity-type/entities';
import { EntityTypeController } from './entity-type/entity-type.controller';
import { EntityTypeService } from './entity-type/entity-type.service';
import { EntityTypeLink } from './entity-type-link/entities';
import { EntityTypeLinkService } from './entity-type-link/entity-type-link.service';
import { EntityTypeFeature, EntityTypeFeatureService, Feature, FeatureController, FeatureService } from './feature';
import { Task, TaskController, TaskHandler, TaskService } from './task';
import { TaskBoardController, TaskBoardService } from './task-board';
import { TaskComment, TaskCommentController, TaskCommentService } from './task-comment';
import { TaskCommentLike, TaskCommentLikeController, TaskCommentLikeService } from './task-comment-like';
import { TaskSubtask, TaskSubtaskController, TaskSubtaskService } from './task-subtask';
import { IdentityController } from './identity/identity.controller';
import { IdentityService } from './identity/identity.service';

import { Note, NoteController, NoteHandler, NoteService } from './note';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      ActivityType,
      Board,
      BoardStage,
      Entity,
      EntityLink,
      EntityType,
      Feature,
      EntityTypeFeature,
      EntityTypeLink,
      ExternalEntity,
      ExternalSystem,
      FileLink,
      Note,
      TaskSubtask,
      Task,
      TaskComment,
      TaskCommentLike,
    ]),
    IAMModule,
    forwardRef(() => MailingModule),
    forwardRef(() => InventoryModule),
    forwardRef(() => CrmReportingModule),
    forwardRef(() => SchedulerModule),
    forwardRef(() => SalesPlanModule),
    forwardRef(() => TelephonyModule),
    forwardRef(() => MultichatModule),
    SalesforceModule,
    StorageModule,
    TaskSettingsModule,
    EntityFieldModule,
    EntityInfoModule,
  ],
  controllers: [
    IdentityController,
    EntityTypeController,
    CreateEntityController,
    CreateSimpleEntityController,
    UpdateEntityController,
    UpdateEntityFieldController,
    DeleteEntityController,
    EntitySearchController,
    GetEntityController,
    EntityBoardController,
    EntityListController,
    GetEntityFilesController,
    AddEntityFilesController,
    NoteController,
    BoardController,
    BoardStageController,
    ActivityTypeController,
    ActivityController,
    TaskController,
    GetTimeBoardController,
    GetTimeBoardMetaController,
    GetTimeBoardCalendarController,
    GetTimeBoardCalendarMetaController,
    GetTimeBoardItemController,
    FeatureController,
    CreateExternalLinkController,
    TaskBoardController,
    ActivityCardController,
    DeleteFileLinkController,
    DeleteFileLinksController,
    TaskSubtaskController,
    TaskCommentController,
    TaskCommentLikeController,
    GetEntitiesImportTemplateController,
    UploadEntitiesImportController,
    GetEntityDocumentsController,
  ],
  providers: [
    IdentityService,
    ActivityCardService,
    ActivityService,
    ActivityHandler,
    ActivityTypeService,
    BaseTaskService,
    BoardService,
    BoardHandler,
    BoardStageService,
    CommonEntityBoardCardService,
    EntityBoardService,
    EntityLinkService,
    EntitySearchService,
    EntityService,
    EntityServiceEmitter,
    EntityServiceHandler,
    EntityTypeFeatureService,
    EntityTypeLinkService,
    EntityTypeService,
    ExternalEntityService,
    ExternalSystemService,
    FeatureService,
    FileLinkService,
    ImportService,
    NoteService,
    NoteHandler,
    ProjectEntityBoardCardService,
    TaskSubtaskService,
    TaskBoardService,
    TaskCommentService,
    TaskCommentLikeService,
    TaskService,
    TaskHandler,
    TimeBoardService,
  ],
  exports: [
    EntityService,
    EntitySearchService,
    EntityTypeService,
    EntityLinkService,
    EntityBoardService,
    EntityTypeFeatureService,
    BoardStageService,
    ActivityService,
    TaskService,
    FileLinkService,
    ActivityTypeService,
    BoardService,
    EntityTypeLinkService,
    NoteService,
    TaskSubtaskService,
    CrmReportingModule,
    EntityFieldModule,
  ],
})
export class CrmModule {}
