import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { TokenService } from '@/common';

import { UserTokenService } from '../../user-token/user-token.service';
import { InvalidSubdomainError, TokenNotFoundError, TokenNotPassedError } from '../errors';
import { TokenPayload } from '../types';

@Injectable()
export class JwtTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userTokenService: UserTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new TokenNotPassedError();
    }

    const payload = this.tokenService.verify<TokenPayload>(token);
    if (payload.subdomain !== request.subdomain) {
      throw InvalidSubdomainError.withName(request.subdomain);
    }
    if (payload.code) {
      const token = await this.userTokenService.use({
        accountId: payload.accountId,
        userId: payload.userId,
        code: payload.code,
      });
      if (!token) {
        throw new TokenNotFoundError();
      }
      if (token.isExpired()) {
        throw new TokenNotFoundError();
      }
    }

    request.token = payload;
    request.accountId = payload.accountId;
    request.userId = payload.userId;

    return !!payload;
  }

  private extractToken(request: Request): string | null {
    return request.headers.authorization?.split(' ')?.[1] ?? null;
  }
}
