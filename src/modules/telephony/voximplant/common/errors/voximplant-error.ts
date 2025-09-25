import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class VoximplantError extends ServiceError {
  constructor({ message = 'Voximplant error', errorCode = 'voximplant' }) {
    super({ errorCode: errorCode, status: HttpStatus.BAD_REQUEST, message });
  }
}
