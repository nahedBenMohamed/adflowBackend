import { HttpStatus } from '@nestjs/common';

import { ServiceError } from './service.error';

export class InvalidPhoneError extends ServiceError {
  constructor(message = 'Invalid phone number') {
    super({ errorCode: 'invalid_phone', status: HttpStatus.BAD_REQUEST, message });
  }
}
