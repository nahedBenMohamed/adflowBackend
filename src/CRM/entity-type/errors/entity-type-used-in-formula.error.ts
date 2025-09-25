import { HttpStatus } from '@nestjs/common';
import { ServiceError } from '@/common';

export class EntityTypeUsedInFormulaError extends ServiceError {
  constructor(message = 'Entity type used in formula') {
    super({
      errorCode: 'entity_type.used_in_formula',
      status: HttpStatus.BAD_REQUEST,
      message,
    });
  }
}
