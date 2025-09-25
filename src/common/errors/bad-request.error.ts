import { HttpStatus } from '@nestjs/common';

import { ServiceError } from './service.error';

export class BadRequestError extends ServiceError {
  constructor(message = 'Bad Request') {
    super({ errorCode: 'bad_request', status: HttpStatus.BAD_REQUEST, message });
  }
}
