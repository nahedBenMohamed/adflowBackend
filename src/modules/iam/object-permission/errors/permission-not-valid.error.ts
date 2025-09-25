import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class PermissionNotValidError extends ServiceError {
  constructor(message = 'Permissions is not valid') {
    super({ errorCode: 'permission_not_valid', status: HttpStatus.FORBIDDEN, message });
  }
}
