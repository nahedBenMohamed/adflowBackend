import { HttpStatus } from '@nestjs/common';
import { ServiceError } from '@/common';

export class TokenNotPassedError extends ServiceError {
  constructor(message = 'Token is not passed') {
    super({ errorCode: 'iam.token_not_passed', status: HttpStatus.UNAUTHORIZED, message });
  }
}
