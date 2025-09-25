import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class UserNotActiveError extends ServiceError {
  constructor(message = 'User is not active') {
    super({ errorCode: 'user_not_active', status: HttpStatus.UNAUTHORIZED, message });
  }

  static withId(userId: number) {
    return new UserNotActiveError(`User with id ${userId} is not active`);
  }

  static fromEmail(email: string): UserNotActiveError {
    return new UserNotActiveError(`User with email ${email} is not active`);
  }
}
