export class NoteEvent {
  accountId: number;
  entityId: number | null;
  noteId: number;

  constructor({ accountId, entityId, noteId }: NoteEvent) {
    this.accountId = accountId;
    this.entityId = entityId;
    this.noteId = noteId;
  }
}
