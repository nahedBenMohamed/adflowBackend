import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const GAClientHeaderName = 'ga-client-id';

export const GAClientId = createParamDecorator((_data: unknown, context: ExecutionContext): string | undefined => {
  const request = context.switchToHttp().getRequest<Request>();

  return request.header(GAClientHeaderName);
});
