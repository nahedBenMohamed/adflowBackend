import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { ForbiddenError } from '@/common';
import { ApplicationConfig } from '@/config';

import { AccountApiAccessService } from '../account-api-access.service';

@Injectable()
export class ApiAccessGuard implements CanActivate {
  private _apiKeyRequired: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly apiAccessService: AccountApiAccessService,
  ) {
    this._apiKeyRequired = this.configService.get<ApplicationConfig>('application').apiKeyRequired;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this._apiKeyRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
      throw new ForbiddenError('API key required');
    }

    const currentApiKey = Array.isArray(apiKey) ? apiKey[0] : apiKey;
    const apiAccess = await this.apiAccessService.findOne({ apiKey: currentApiKey });
    if (apiAccess) {
      request.callerAccountId = apiAccess?.accountId;

      return true;
    }

    throw new ForbiddenError('Unknown API key');
  }
}
