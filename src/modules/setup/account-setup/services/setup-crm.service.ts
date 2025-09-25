import { Injectable } from '@nestjs/common';

import { User } from '@/modules/iam/user/entities/user.entity';
import {
  RmsActivityService,
  RmsBoardService,
  RmsEntityTypeService,
  RmsEntityService,
  RmsFieldService,
  RmsNoteService,
  RmsTaskService,
} from './crm';

interface CrmMaps {
  entityTypesMap: Map<number, number>;
  entitiesMap: Map<number, number>;
  activitiesMap: Map<number, number>;
  notesMap: Map<number, number>;
  tasksMap: Map<number, number>;
}

@Injectable()
export class SetupCrmService {
  constructor(
    private readonly rmsActivityService: RmsActivityService,
    private readonly rmsBoardService: RmsBoardService,
    private readonly rmsEntityTypeService: RmsEntityTypeService,
    private readonly rmsEntityService: RmsEntityService,
    private readonly rmsFieldService: RmsFieldService,
    private readonly rmsNoteService: RmsNoteService,
    private readonly rmsTaskService: RmsTaskService,
  ) {}

  public async setupDefault(accountId: number, owner: User) {
    await this.rmsBoardService.setupDefault(accountId, owner);
    await this.rmsActivityService.setupDefault(accountId);
  }

  public async copyAll(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    entityTypeIds?: number[],
  ): Promise<CrmMaps> {
    const entityTypesMap = await this.rmsEntityTypeService.copyEntityTypes(rmsAccountId, accountId, entityTypeIds);

    const { boardsMap, stagesMap } = await this.rmsBoardService.copyBoardsAndStages(
      rmsAccountId,
      accountId,
      usersMap,
      entityTypesMap,
    );

    const entitiesMap = await this.rmsEntityService.copyEntities(
      rmsAccountId,
      accountId,
      usersMap,
      entityTypesMap,
      boardsMap,
      stagesMap,
    );

    await this.rmsFieldService.copyAll(rmsAccountId, accountId, usersMap, entityTypesMap, entitiesMap, stagesMap);

    const tasksMap = await this.rmsTaskService.copyAll(
      rmsAccountId,
      accountId,
      usersMap,
      entityTypesMap,
      entitiesMap,
      boardsMap,
      stagesMap,
    );

    const activitiesMap = await this.rmsActivityService.copyAll(rmsAccountId, accountId, usersMap, entitiesMap);

    const notesMap = await this.rmsNoteService.copyNotes(rmsAccountId, accountId, usersMap, entitiesMap);

    return { entityTypesMap, entitiesMap, activitiesMap, notesMap, tasksMap };
  }
}
