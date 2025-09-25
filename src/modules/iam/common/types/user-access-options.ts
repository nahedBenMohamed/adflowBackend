import type { UserRole } from '../enums/user-role.enum';

export interface UserAccessOptions {
  adminOnly?: boolean;
  roles?: UserRole[];
}
