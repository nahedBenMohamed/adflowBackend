import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { PermissionAction, PermissionLevel } from '../../common';

import { ObjectPermissionDto } from '../dto';

const validatePermission = ({
  permission,
  hasDepartmentId,
}: {
  permission: PermissionLevel;
  hasDepartmentId: boolean;
}): PermissionLevel => {
  return !hasDepartmentId && [PermissionLevel.SUBDEPARTMENT, PermissionLevel.DEPARTMENT].includes(permission)
    ? PermissionLevel.RESPONSIBLE
    : permission;
};

@Entity()
export class ObjectPermission {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  userId: number;

  @Column()
  objectType: string;

  @Column({ nullable: true })
  objectId: number | null;

  @Column()
  createPermission: PermissionLevel;

  @Column()
  viewPermission: PermissionLevel;

  @Column()
  editPermission: PermissionLevel;

  @Column()
  deletePermission: PermissionLevel;

  @Column()
  reportPermission: PermissionLevel;

  @Column()
  dashboardPermission: PermissionLevel;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    userId: number,
    objectType: string,
    objectId: number | null,
    createPermission: PermissionLevel,
    viewPermission: PermissionLevel,
    editPermission: PermissionLevel,
    deletePermission: PermissionLevel,
    reportPermission: PermissionLevel,
    dashboardPermission: PermissionLevel,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.userId = userId;
    this.objectType = objectType;
    this.objectId = objectId;
    this.createPermission = createPermission;
    this.viewPermission = viewPermission;
    this.editPermission = editPermission;
    this.deletePermission = deletePermission;
    this.reportPermission = reportPermission;
    this.dashboardPermission = dashboardPermission;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public static fromDto({
    accountId,
    userId,
    hasDepartmentId,
    dto,
  }: {
    accountId: number;
    userId: number;
    hasDepartmentId: boolean;
    dto: ObjectPermissionDto;
  }): ObjectPermission {
    return new ObjectPermission(
      accountId,
      userId,
      dto.objectType,
      dto.objectId,
      validatePermission({ permission: dto.createPermission, hasDepartmentId }),
      validatePermission({ permission: dto.viewPermission, hasDepartmentId }),
      validatePermission({ permission: dto.editPermission, hasDepartmentId }),
      validatePermission({ permission: dto.deletePermission, hasDepartmentId }),
      validatePermission({
        permission: dto.reportPermission ?? dto.editPermission,
        hasDepartmentId,
      }),
      validatePermission({
        permission: dto.dashboardPermission ?? dto.editPermission,
        hasDepartmentId,
      }),
    );
  }

  public update({ hasDepartmentId, dto }: { hasDepartmentId: boolean; dto: ObjectPermissionDto }): ObjectPermission {
    this.objectType = dto.objectType;
    this.objectId = dto.objectId;
    this.createPermission = validatePermission({ permission: dto.createPermission, hasDepartmentId });
    this.viewPermission = validatePermission({ permission: dto.viewPermission, hasDepartmentId });
    this.editPermission = validatePermission({ permission: dto.editPermission, hasDepartmentId });
    this.deletePermission = validatePermission({ permission: dto.deletePermission, hasDepartmentId });
    this.reportPermission = validatePermission({
      permission: dto.reportPermission ?? dto.editPermission,
      hasDepartmentId,
    });
    this.dashboardPermission = validatePermission({
      permission: dto.dashboardPermission ?? dto.editPermission,
      hasDepartmentId,
    });

    return this;
  }

  public getPermissionLevel(action: PermissionAction): PermissionLevel {
    switch (action) {
      case PermissionAction.Create:
        return this.createPermission;
      case PermissionAction.View:
        return this.viewPermission;
      case PermissionAction.Edit:
        return this.editPermission;
      case PermissionAction.Delete:
        return this.deletePermission;
      case PermissionAction.Report:
        return this.reportPermission;
      case PermissionAction.Dashboard:
        return this.dashboardPermission;
    }
  }

  public toDto(): ObjectPermissionDto {
    return {
      objectType: this.objectType,
      objectId: this.objectId,
      createPermission: this.createPermission,
      viewPermission: this.viewPermission,
      editPermission: this.editPermission,
      deletePermission: this.deletePermission,
      reportPermission: this.reportPermission,
      dashboardPermission: this.dashboardPermission,
    };
  }

  public same({ objectType, objectId }: { objectType: string; objectId: number | null }): boolean {
    return this.objectType === objectType && this.objectId === objectId;
  }
}
