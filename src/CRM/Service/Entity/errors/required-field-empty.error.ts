import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class RequiredFieldEmptyError extends ServiceError {
  constructor(message = 'Required field do not set') {
    super({ errorCode: 'required_field_empty', status: HttpStatus.BAD_REQUEST, message });
  }
}
