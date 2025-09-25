import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class MailConnectionError extends ServiceError {
  constructor(message = 'Connection error') {
    super({ errorCode: 'mail.connection_error', status: HttpStatus.BAD_REQUEST, message });
  }
}
