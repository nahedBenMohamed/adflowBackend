import { BoardStageEvent } from './board-stage.event';

export class BoardStageDeletedEvent extends BoardStageEvent {
  newStageId?: number | null;

  constructor({ accountId, boardId, stageId, newStageId }: BoardStageDeletedEvent) {
    super({ accountId, boardId, stageId });

    this.newStageId = newStageId;
  }
}
