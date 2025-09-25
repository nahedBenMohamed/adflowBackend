import { HttpStatus } from '@nestjs/common';
import { ServiceError } from '@/common';

export class InvalidSubdomainError extends ServiceError {
  constructor(message = 'Invalid subdomain') {
    super({ errorCode: 'iam.invalid_subdomain', status: HttpStatus.UNAUTHORIZED, message });
  }

  static withName(name: string): InvalidSubdomainError {
    return new InvalidSubdomainError(`Subdomain name ${name} is not valid`);
  }
}
