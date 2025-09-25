import { Logger } from '@nestjs/common';

type Task = () => Promise<void>;

export class TaskQueue {
  private readonly logger = new Logger(TaskQueue.name);
  private readonly queue: Task[] = [];
  private isProcessing = false;

  enqueue(task: Task) {
    this.queue.push(task);
    this.process();
  }

  private async process() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      try {
        await task();
      } catch (e) {
        const error = e as Error;
        this.logger.error(`Process task failed: ${error?.message}`, error?.stack);
      }
    }

    this.isProcessing = false;
  }
}
