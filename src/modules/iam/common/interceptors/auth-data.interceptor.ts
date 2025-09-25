import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { AccountService } from '../../account/account.service';
import { UserService } from '../../user/user.service';
import { DataPrefetch } from '../types/data-prefetch';

@Injectable()
export class AuthDataInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();

    const prefetch = this.reflector.getAllAndOverride<DataPrefetch>('prefetch', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!request.account && prefetch?.account) {
      request.account = await this.accountService.findOne({ accountId: request.accountId });
    }
    if (!request.user && prefetch?.user) {
      request.user = await this.userService.findOne({ accountId: request.accountId, id: request.userId });
    }

    return next.handle();
  }
}
