import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { UserService } from '../../user/user.service';
import { UserAccessOptions } from '../types/user-access-options';
import { User } from '../../user/entities';

@Injectable()
export class UserAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<UserAccessOptions>('user_access', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!options) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.user) {
      request.user = await this.userService.findOne({ accountId: request.accountId, id: request.userId });
    }

    const user = request.user as User;
    if (options.roles) {
      return options.roles.includes(user.role);
    } else if (options.adminOnly) {
      return user.isAdmin;
    }

    return true;
  }
}
