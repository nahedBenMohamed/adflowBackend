import { NoteEvent } from './note.event';

export class NoteCreatedEvent extends NoteEvent {
  entityName: string;
  createdBy: number;
  ownerId: number;
  noteText: string;
  createdAt: string;

  constructor({ accountId, entityId, entityName, createdBy, ownerId, noteId, noteText, createdAt }: NoteCreatedEvent) {
    super({ accountId, entityId, noteId });
    this.entityName = entityName;
    this.createdBy = createdBy;
    this.ownerId = ownerId;
    this.noteText = noteText;
    this.createdAt = createdAt;
  }
}
