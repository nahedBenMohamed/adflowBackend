import { UseGuards, applyDecorators } from '@nestjs/common';

import { ApiAccessGuard } from '../../account-api-access';

export const ApiAccessRequired = () => {
  return applyDecorators(UseGuards(ApiAccessGuard));
};
