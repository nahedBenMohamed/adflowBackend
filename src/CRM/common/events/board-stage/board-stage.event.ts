export class BoardStageEvent {
  accountId: number;
  boardId: number;
  stageId: number;

  constructor({ accountId, boardId, stageId }: BoardStageEvent) {
    this.accountId = accountId;
    this.boardId = boardId;
    this.stageId = stageId;
  }
}
