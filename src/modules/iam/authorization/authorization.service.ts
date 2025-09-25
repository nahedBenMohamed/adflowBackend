import { Injectable } from '@nestjs/common';

import { ForbiddenError } from '@/common';

import { Authorizable, PermissionAction, PermissionLevel, UserRights, UserRole } from '../common';

import { ObjectPermissionService } from '../object-permission/object-permission.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { DepartmentService } from '../department/department.service';

interface Permissions {
  allow: boolean;
  userIds?: number[];
  departmentIds?: number[];
}

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly objectPermissionService: ObjectPermissionService,
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
  ) {}

  public async check({
    action,
    user,
    authorizable,
    throwError = false,
  }: {
    action: `${PermissionAction}`;
    user: User;
    authorizable: Authorizable;
    throwError?: boolean;
  }) {
    const { allow } = await this.getPermissions({ action, user, authorizable });
    if (throwError && !allow) {
      throw new ForbiddenError();
    }
    return allow;
  }

  public async getUserRights({ user, authorizable }: { user: User; authorizable: Authorizable }): Promise<UserRights> {
    const { allow: canView } = await this.getPermissions({ action: 'view', user, authorizable });
    const { allow: canEdit } = await this.getPermissions({ action: 'edit', user, authorizable });
    const { allow: canDelete } = await this.getPermissions({ action: 'delete', user, authorizable });

    return { canView, canEdit, canDelete };
  }

  public async whoCanView({
    user,
    authorizable,
  }: {
    user: User;
    authorizable: Authorizable;
  }): Promise<number[] | undefined> {
    const { userIds } = await this.getPermissions({ action: 'view', user, authorizable });

    return userIds;
  }

  public async getPermissions({
    action,
    user,
    authorizable,
  }: {
    action: `${PermissionAction}`;
    user: User;
    authorizable: Authorizable;
  }): Promise<Permissions> {
    if (user.role === UserRole.OWNER || user.role === UserRole.ADMIN) {
      return { allow: true };
    }

    const authObject = authorizable.getAuthorizableObject();

    if (action === PermissionAction.View && user.id === authObject.createdBy) {
      return { allow: true };
    }
    if (authObject.participantIds && authObject.participantIds.includes(user.id)) {
      return { allow: true };
    }

    const op = await this.objectPermissionService.findOne({
      accountId: user.accountId,
      userId: user.id,
      objectType: authObject.type,
      objectId: authObject.id,
    });
    const permissionLevel = op ? op.getPermissionLevel(action as PermissionAction) : PermissionLevel.DENIED;

    if (permissionLevel === PermissionLevel.ALLOWED) {
      return { allow: true };
    } else if (permissionLevel === PermissionLevel.RESPONSIBLE) {
      return {
        allow:
          (!authObject.ownerId && !authObject.departmentId) ||
          (authObject.ownerId && authObject.ownerId === user.id) ||
          (authObject.departmentId && authObject.departmentId === user.departmentId),
        userIds: [user.id],
        departmentIds: [user.departmentId],
      };
    } else if (permissionLevel === PermissionLevel.SUBDEPARTMENT || permissionLevel === PermissionLevel.DEPARTMENT) {
      const departmentIds = await this.departmentService.getSubordinatesIds({
        accountId: user.accountId,
        departmentId: user.departmentId,
        fromParent: permissionLevel === PermissionLevel.DEPARTMENT,
      });
      const userIds = await this.userService.getCoworkerIds({ accountId: user.accountId, departmentIds });
      return {
        allow:
          (!authObject.ownerId && !authObject.departmentId) ||
          (authObject.ownerId && userIds.includes(authObject.ownerId)) ||
          (authObject.departmentId && departmentIds.includes(authObject.departmentId)),
        userIds,
        departmentIds,
      };
    }
    return { allow: false, userIds: [], departmentIds: [] };
  }
}
