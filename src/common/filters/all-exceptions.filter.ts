import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { ServiceError } from '../errors';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter<unknown> {
  private readonly logger = new Logger('Exception');

  override catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const requestStr = `${request.id ?? ''} ${request.method} ${request.hostname}${request.originalUrl}`;
    const user = `User: <${request.accountId ?? ''}; ${request.userId ?? ''}; ${request.ips?.[0] ?? request.ip}>`;
    const body = `Body: ${JSON.stringify(request.body)}`;
    const msg = `${requestStr}\t${body}\t${user}`;

    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode: string | undefined = 'INTERNAL_SERVER_ERROR';
    let message: string | undefined = undefined;
    let details: unknown | undefined = undefined;

    if (exception instanceof ServiceError) {
      this.logger.warn(`${msg}\tError: ${JSON.stringify(exception)}`, 'Request');
      errorCode = exception.errorCode;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof QueryFailedError) {
      this.logger.error(
        `${msg}\tQuery: ${exception.query} -- PARAMETERS: [${exception.parameters}]`,
        exception.stack,
        'SQL',
      );
      errorCode = 'SQL_ERROR';
      message = exception.message;
      details = exception.driverError?.detail ?? exception.driverError?.message ?? exception.driverError?.toString();
    } else if (exception instanceof HttpException) {
      this.logger.error(`${msg}\tResponse: ${JSON.stringify(exception.getResponse())}`, exception.stack);
      message = exception.message;
      details = exception.getResponse();
    } else if (exception instanceof Error) {
      this.logger.error(`${msg}\tMessage: ${exception.message}`, exception.stack);
      message = exception.message;
      details = exception.stack;
    } else {
      this.logger.error(`${msg}`, exception['stack']);
    }

    response
      .status(statusCode)
      .json({ statusCode, errorCode, message, details, timestamp: new Date().toISOString(), path: request.url });
  }
}
