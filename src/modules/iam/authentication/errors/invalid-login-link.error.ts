import { HttpStatus } from '@nestjs/common';
import { ServiceError } from '@/common';

export class InvalidLoginLinkError extends ServiceError {
  constructor(message = 'Invalid login link') {
    super({ errorCode: 'invalid_login_link', status: HttpStatus.UNAUTHORIZED, message });
  }
}
