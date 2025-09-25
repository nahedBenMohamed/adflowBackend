import { SetMetadata } from '@nestjs/common';

import type { UserAccessOptions } from '../types/user-access-options';

export const UserAccess = (options?: UserAccessOptions) => SetMetadata('user_access', options);
