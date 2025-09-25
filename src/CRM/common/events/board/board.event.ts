export class BoardEvent {
  accountId: number;
  userId: number;
  boardId: number;

  constructor({ accountId, userId, boardId }: BoardEvent) {
    this.accountId = accountId;
    this.userId = userId;
    this.boardId = boardId;
  }
}
