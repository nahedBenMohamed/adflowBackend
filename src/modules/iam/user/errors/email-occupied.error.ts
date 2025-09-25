import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class EmailOccupiedError extends ServiceError {
  constructor(message = 'Email is occupied') {
    super({ errorCode: 'email_occupied', status: HttpStatus.FORBIDDEN, message });
  }

  public static fromEmail(email: string): EmailOccupiedError {
    return new EmailOccupiedError(`Email ${email} is occupied`);
  }

  //TODO: remove string description for error code
  public static forAccountCreation(): EmailOccupiedError {
    return new EmailOccupiedError(
      'This email has already been used for registration. You can log in or, if you ' +
        'have forgotten your password, recover it. Alternatively, use a different email for registration.',
    );
  }
}
