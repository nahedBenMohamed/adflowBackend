import { HttpStatus } from '@nestjs/common';
import { ServiceError } from '@/common';

export class TokenExpiredError extends ServiceError {
  constructor(message = 'Token expired') {
    super({ errorCode: 'iam.token_expired', status: HttpStatus.UNAUTHORIZED, message });
  }
}
