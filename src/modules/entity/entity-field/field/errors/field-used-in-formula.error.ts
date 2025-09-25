import { HttpStatus } from '@nestjs/common';
import { ServiceError } from '@/common';

export class FieldUsedInFormulaError extends ServiceError {
  constructor(fieldId: number, message = 'Field used in formula') {
    super({
      errorCode: 'field.used_in_formula',
      status: HttpStatus.BAD_REQUEST,
      message,
      details: { fieldId },
    });
  }
}
