import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class InvalidDiscountError extends ServiceError {
  constructor(message = 'Discount cannot be more than 100% and less than 0%') {
    super({ errorCode: 'products.invalid_discount', status: HttpStatus.BAD_REQUEST, message });
  }
}
