export class EntityTypeApplyEvent {
  accountId: number;
  automationId: number;
  processId: number;
  entityTypeId: number;
  boardId?: number | null;
  stageId?: number | null;

  constructor({ accountId, automationId, processId, entityTypeId, boardId, stageId }: EntityTypeApplyEvent) {
    this.accountId = accountId;
    this.automationId = automationId;
    this.processId = processId;
    this.entityTypeId = entityTypeId;
    this.boardId = boardId;
    this.stageId = stageId;
  }
}
