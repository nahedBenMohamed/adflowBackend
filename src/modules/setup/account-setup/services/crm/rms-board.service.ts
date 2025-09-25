import { Injectable } from '@nestjs/common';

import { User } from '@/modules/iam/user/entities/user.entity';

import { BoardService } from '@/CRM/board/board.service';
import { BoardType } from '@/CRM/board/enums';
import { BoardStageService } from '@/CRM/board-stage';

@Injectable()
export class RmsBoardService {
  constructor(
    private readonly boardService: BoardService,
    private readonly stageService: BoardStageService,
  ) {}

  public async setupDefault(accountId: number, owner: User) {
    await this.boardService.create({
      accountId,
      user: owner,
      dto: { name: 'Tasks board', type: BoardType.Task, recordId: null, sortOrder: 0 },
      options: { isSystem: true },
    });
  }

  public async copyBoardsAndStages(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    entityTypesMap: Map<number, number>,
  ): Promise<{ boardsMap: Map<number, number>; stagesMap: Map<number, number> }> {
    const boardsMap = await this.copyBoards(rmsAccountId, accountId, usersMap, entityTypesMap);
    const stagesMap = await this.copyStages(rmsAccountId, accountId, boardsMap);

    return { boardsMap, stagesMap };
  }

  private async copyBoards(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    entityTypesMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const boardsMap = new Map<number, number>();

    const rmsBoards = await this.boardService.findMany({
      filter: { accountId: rmsAccountId, isSystem: true },
    });
    for (const rmsEntityTypeId of entityTypesMap.keys()) {
      const rmsEtBoards = await this.boardService.findMany({
        filter: { accountId: rmsAccountId, recordId: rmsEntityTypeId },
      });
      for (const rmsEtBoard of rmsEtBoards) {
        if (rmsEtBoard.taskBoardId) {
          const rmsEtTaskBoard = await this.boardService.findOne({
            filter: { accountId: rmsAccountId, boardId: rmsEtBoard.taskBoardId },
          });
          rmsBoards.push(rmsEtTaskBoard);
        }
        rmsBoards.push(rmsEtBoard);
      }
    }
    for (const rmsBoard of rmsBoards) {
      const board = await this.boardService.create({
        accountId,
        user: rmsBoard.ownerId ? usersMap.get(rmsBoard.ownerId) : null,
        dto: {
          name: rmsBoard.name,
          type: rmsBoard.type,
          recordId: rmsBoard.recordId ? entityTypesMap.get(rmsBoard.recordId) : null,
          sortOrder: rmsBoard.sortOrder,
          participantIds: rmsBoard.participantIds ? rmsBoard.participantIds.map((id) => usersMap.get(id).id) : null,
        },
        options: {
          ownerId: rmsBoard.ownerId ? usersMap.get(rmsBoard.ownerId).id : null,
          isSystem: rmsBoard.isSystem,
          taskBoardId: rmsBoard.taskBoardId ? boardsMap.get(rmsBoard.taskBoardId) : null,
          createDefaultStages: false,
        },
      });
      boardsMap.set(rmsBoard.id, board.id);
    }

    return boardsMap;
  }

  private async copyStages(
    rmsAccountId: number,
    accountId: number,
    boardsMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const stagesMap = new Map<number, number>();

    for (const [rmsBoardId, boardId] of boardsMap) {
      const rmsStages = await this.stageService.findMany({ accountId: rmsAccountId, boardId: rmsBoardId });
      for (const rmsStage of rmsStages) {
        const stage = await this.stageService.create({
          accountId,
          boardId,
          dto: {
            name: rmsStage.name,
            color: rmsStage.color,
            code: rmsStage.code,
            isSystem: rmsStage.isSystem,
            sortOrder: rmsStage.sortOrder,
          },
        });
        stagesMap.set(rmsStage.id, stage.id);
      }
    }

    return stagesMap;
  }
}
