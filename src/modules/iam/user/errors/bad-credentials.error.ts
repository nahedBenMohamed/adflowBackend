import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class BadCredentialsError extends ServiceError {
  constructor(message = 'Bad credentials') {
    super({ errorCode: 'bad_credentials', status: HttpStatus.FORBIDDEN, message });
  }
}
