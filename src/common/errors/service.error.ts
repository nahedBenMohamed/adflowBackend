import { HttpException, HttpStatus } from '@nestjs/common';

interface ServiceErrorOptions {
  message: string;
  errorCode: string;
  status: HttpStatus;
  details?: object;
  cause?: unknown;
  description?: string;
}

export class ServiceError extends HttpException {
  errorCode: string;
  details?: object;

  constructor({ errorCode, status, message, details, cause, description }: ServiceErrorOptions) {
    super(message, status, { cause, description });

    this.errorCode = errorCode ?? 'internal_server_error';
    this.details = details;
  }
}
