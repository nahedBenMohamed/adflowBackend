import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class MailboxLockService {
  private mailboxLocks = new Map<number, boolean>();
  private mailboxEvents = new Map<number, EventEmitter>();

  lock(mailboxId: number): boolean {
    if (this.mailboxLocks.get(mailboxId)) {
      return false;
    }
    this.mailboxLocks.set(mailboxId, true);
    return true;
  }

  unlock(mailboxId: number): void {
    this.mailboxLocks.set(mailboxId, false);
    this.emitUnlockEvent(mailboxId);
  }

  private emitUnlockEvent(mailboxId: number): void {
    const eventEmitter = this.mailboxEvents.get(mailboxId);
    if (eventEmitter) {
      eventEmitter.emit('unlock');
      this.mailboxEvents.delete(mailboxId);
    }
  }

  async waitForUnlock(mailboxId: number): Promise<void> {
    if (!this.mailboxLocks.get(mailboxId)) {
      return;
    }

    return new Promise((resolve) => {
      const eventEmitter = this.mailboxEvents.get(mailboxId) ?? new EventEmitter();
      eventEmitter.once('unlock', resolve);
      this.mailboxEvents.set(mailboxId, eventEmitter);
    });
  }
}
