import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { type Account } from '../../account/entities/account.entity';
import { type User } from '../../user/entities/user.entity';
import { type AuthData } from '../types/auth-data';
import { type TokenPayload } from '../types/token-payload';

export const CurrentAuth = createParamDecorator((_data: unknown, context: ExecutionContext): AuthData => {
  const request = context.switchToHttp().getRequest<Request>();
  return {
    accountId: request.accountId,
    userId: request.userId,
    account: request.account as Account,
    user: request.user as User,
    token: request.token as TokenPayload,
  };
});
