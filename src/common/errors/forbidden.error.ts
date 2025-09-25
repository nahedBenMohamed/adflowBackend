import { HttpStatus } from '@nestjs/common';

import { ServiceError } from './service.error';

export class ForbiddenError extends ServiceError {
  constructor(message = 'Item is forbidden') {
    super({ errorCode: 'forbidden', status: HttpStatus.FORBIDDEN, message });
  }
}
