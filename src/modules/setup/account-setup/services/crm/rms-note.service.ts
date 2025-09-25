import { Injectable } from '@nestjs/common';

import { User } from '@/modules/iam/user/entities/user.entity';

import { NoteService } from '@/CRM/note/note.service';

@Injectable()
export class RmsNoteService {
  constructor(private readonly noteService: NoteService) {}

  public async copyNotes(
    rmsAccountId: number,
    accountId: number,
    usersMap: Map<number, User>,
    entitiesMap: Map<number, number>,
  ): Promise<Map<number, number>> {
    const notesMap = new Map<number, number>();

    const rmsNotes = await this.noteService.findMany({ accountId: rmsAccountId });
    for (const rmsNote of rmsNotes) {
      if (entitiesMap.has(rmsNote.entityId)) {
        const note = await this.noteService.create({
          accountId,
          userId: usersMap.get(rmsNote.createdBy).id,
          entityId: entitiesMap.get(rmsNote.entityId),
          dto: { text: rmsNote.text },
        });
        notesMap.set(rmsNote.id, note.id);
      }
    }

    return notesMap;
  }
}
