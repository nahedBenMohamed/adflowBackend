import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class ReadonlyFieldChangedError extends ServiceError {
  constructor(message = 'Readonly field changed') {
    super({ errorCode: 'entity.readonly_field_changed', status: HttpStatus.BAD_REQUEST, message });
  }
}
