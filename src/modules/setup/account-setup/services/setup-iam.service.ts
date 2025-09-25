import { Injectable } from '@nestjs/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { UserRole } from '@/modules/iam/common/enums/user-role.enum';
import { DepartmentService } from '@/modules/iam/department/department.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { UserService } from '@/modules/iam/user/user.service';
import { StorageService } from '@/modules/storage/storage.service';
import { StorageFile } from '@/modules/storage/types/storage-file';

interface IAMMaps {
  usersMap: Map<number, User>;
  rmsOwner: User;
  departmentsMap: Map<number, number>;
}

@Injectable()
export class SetupIAMService {
  constructor(
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
    private readonly storageService: StorageService,
  ) {}

  public async copyAll(rmsAccountId: number, account: Account, owner: User): Promise<IAMMaps> {
    const departmentsMap = await this.copyDepartments(rmsAccountId, account.id);
    const [rmsOwner, usersMap] = await this.copyUsers(rmsAccountId, account, owner, departmentsMap);

    return { usersMap, rmsOwner, departmentsMap };
  }

  private async copyDepartments(
    rmsAccountId: number,
    accountId: number,
    departmentMap: Map<number, number> = new Map<number, number>(),
    parentId: number = null,
  ): Promise<Map<number, number>> {
    const rmsDepartments = await this.departmentService.getHierarchy({
      accountId: rmsAccountId,
      departmentId: parentId,
      expand: ['settings'],
    });
    for (const rmsDepartment of rmsDepartments) {
      const department = await this.departmentService.create({
        accountId,
        dto: {
          name: rmsDepartment.name,
          parentId: rmsDepartment.parentId ? departmentMap.get(rmsDepartment.parentId) : null,
          settings: rmsDepartment.settings ? rmsDepartment.settings.toDto() : undefined,
        },
      });
      departmentMap.set(rmsDepartment.id, department.id);
      await this.copyDepartments(rmsAccountId, accountId, departmentMap, rmsDepartment.id);
    }

    return departmentMap;
  }

  private async copyUsers(
    rmsAccountId: number,
    account: Account,
    owner: User,
    departmentsMap: Map<number, number>,
  ): Promise<[User, Map<number, User>]> {
    const usersMap = new Map<number, User>();
    const rmsUsers = await this.userService.findMany({ accountId: rmsAccountId });
    let rmsOwner: User = null;
    for (const rmsUser of rmsUsers) {
      if (rmsUser.role === UserRole.OWNER) {
        usersMap.set(rmsUser.id, owner);
        rmsOwner = rmsUser;
      } else {
        const user = await this.userService.create({
          account,
          dto: {
            firstName: rmsUser.firstName,
            lastName: rmsUser.lastName,
            email: `${account.id}${rmsUser.email}`,
            password: `${account.id}${rmsUser.email}`,
            phone: rmsUser.phone,
            role: rmsUser.role,
            isActive: rmsUser.isActive,
            departmentId: rmsUser.departmentId ? departmentsMap.get(rmsUser.departmentId) : null,
            position: rmsUser.position,
          },
        });

        if (rmsUser.avatarId) {
          const { file, content } = await this.storageService.getFile({
            fileId: rmsUser.avatarId,
            accountId: rmsAccountId,
          });
          await this.userService.setAvatar({
            account,
            userId: user.id,
            file: StorageFile.fromFileInfo(file, Buffer.from(content)),
          });
        }

        usersMap.set(rmsUser.id, user);
      }
    }

    return [rmsOwner, usersMap];
  }
}
