import { HttpStatus } from '@nestjs/common';
import { ServiceError } from '../../../errors';

export class InvalidTokenError extends ServiceError {
  constructor(message = 'Invalid token') {
    super({ errorCode: 'invalid_token', status: HttpStatus.UNAUTHORIZED, message });
  }
}
