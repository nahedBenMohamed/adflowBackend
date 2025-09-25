import { SetMetadata, UseGuards, UseInterceptors, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ApiAccessGuard } from '../../account-api-access';
import { AuthDataInterceptor } from '../interceptors/auth-data.interceptor';
import { DataPrefetch } from '../types/data-prefetch';
import { UserAccessOptions } from '../types/user-access-options';
import { UserAccessGuard } from '../guards/user-access.guard';
import { JwtTokenGuard } from '../guards/jwt-token.guard';

interface JwtAuthorizedOptions {
  prefetch?: DataPrefetch;
  access?: UserAccessOptions;
}

export const JwtAuthorized = (options?: JwtAuthorizedOptions) => {
  return applyDecorators(
    SetMetadata('prefetch', options?.prefetch),
    SetMetadata('user_access', options?.access),
    UseGuards(ApiAccessGuard),
    UseGuards(JwtTokenGuard),
    UseGuards(UserAccessGuard),
    UseInterceptors(AuthDataInterceptor),
    ApiBearerAuth(),
  );
};
