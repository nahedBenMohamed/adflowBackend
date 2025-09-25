import { HttpStatus } from '@nestjs/common';

import { ServiceError } from './service.error';

export class NotFoundError extends ServiceError {
  constructor(message: string) {
    super({ errorCode: 'not_found', status: HttpStatus.NOT_FOUND, message });
  }

  static fromNamed<T extends { name: string }>(named: T, message = 'is not found') {
    return new NotFoundError(`${named.name} ${message}`);
  }

  static withMessage<T extends { name: string }>(named: T, message?: string) {
    return NotFoundError.fromNamed(named, message);
  }

  static withId<T extends { name: string }>(named: T, id: number | string) {
    return NotFoundError.withMessage(named, `with id ${id} is not found`);
  }
}
