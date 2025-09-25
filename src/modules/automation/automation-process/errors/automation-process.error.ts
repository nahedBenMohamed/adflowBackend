import { HttpStatus } from '@nestjs/common';
import { ServiceError } from '@/common';

export class AutomationProcessError extends ServiceError {
  constructor({ processId, message = 'Automation process error' }: { processId: number; message?: string }) {
    super({
      errorCode: 'automation.process_error',
      status: HttpStatus.BAD_REQUEST,
      message,
      details: { processId },
    });
  }
}
