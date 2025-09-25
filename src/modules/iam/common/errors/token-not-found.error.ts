import { HttpStatus } from '@nestjs/common';
import { ServiceError } from '@/common';

export class TokenNotFoundError extends ServiceError {
  constructor(message = 'Token is not found') {
    super({ errorCode: 'iam.token_not_found', status: HttpStatus.UNAUTHORIZED, message });
  }
}
