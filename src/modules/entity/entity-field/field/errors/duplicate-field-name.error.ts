import { HttpStatus } from '@nestjs/common';
import { ServiceError } from '@/common';

export class DuplicateFieldNameError extends ServiceError {
  constructor(fieldName: string, message = 'Field name is already used') {
    super({
      errorCode: 'field.duplicate_name',
      status: HttpStatus.BAD_REQUEST,
      message,
      details: { fieldName },
    });
  }
}
