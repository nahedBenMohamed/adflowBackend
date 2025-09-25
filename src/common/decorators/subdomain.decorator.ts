import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Subdomain = createParamDecorator((_data: unknown, context: ExecutionContext): string | null => {
  const request = context.switchToHttp().getRequest<Request>();

  return request.subdomain;
});
