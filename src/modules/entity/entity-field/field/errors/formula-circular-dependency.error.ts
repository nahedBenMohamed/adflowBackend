import { HttpStatus } from '@nestjs/common';
import { ServiceError } from '@/common';

export class FormulaCircularDependencyError extends ServiceError {
  constructor(fieldId: number, message = 'Field formula circular dependency detected') {
    super({
      errorCode: 'field.formula_circular_dependency',
      status: HttpStatus.BAD_REQUEST,
      message,
      details: { fieldId },
    });
  }
}
