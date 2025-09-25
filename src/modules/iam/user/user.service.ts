import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ForbiddenError, NotFoundError, PasswordUtil, PhoneUtil } from '@/common';

import { StorageUrlService } from '@/modules/storage/storage-url.service';
import { StorageService } from '@/modules/storage/storage.service';
import { StorageFile } from '@/modules/storage/types/storage-file';

import { IamEventType, UserCreatedEvent, UserDeletedEvent, UserRole } from '../common';
import { Account } from '../account/entities/account.entity';
import { ObjectPermissionService } from '../object-permission/object-permission.service';

import { CreateUserDto, UpdateUserDto, ChangeUserPasswordDto } from './dto';
import { User, UsersAccessibleUsers } from './entities';
import { EmailOccupiedError, BadCredentialsError } from './errors';
import { ExpandableField } from './types';

interface CreateOptions {
  skipPhoneCheck?: boolean;
  createdAt?: Date;
}

interface FindFilter {
  accountId?: number;
  id?: number | number[];
  email?: string;
  isActive?: boolean;
  departmentId?: number | number[];
  role?: UserRole;
  fullName?: string;
}
interface FindOptions {
  account?: Account;
  expand?: ExpandableField[];
}

const cacheKey = ({ accountId, userId }: { accountId: number; userId: number }) => `User:${accountId}:${userId}`;

@Injectable()
export class UserService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(UsersAccessibleUsers)
    private readonly repositoryUAU: Repository<UsersAccessibleUsers>,
    private readonly dataSource: DataSource,
    private readonly objectPermissionService: ObjectPermissionService,
    @Inject(forwardRef(() => StorageService))
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => StorageUrlService))
    private readonly storageUrlService: StorageUrlService,
  ) {}

  async create({
    account,
    dto,
    options,
  }: {
    account: Account;
    dto: CreateUserDto;
    options?: CreateOptions;
  }): Promise<User> {
    if (await this.isEmailOccupied(dto.email)) {
      throw EmailOccupiedError.fromEmail(dto.email);
    }

    dto.phone = dto.phone && !options?.skipPhoneCheck ? PhoneUtil.normalize(dto.phone) : dto.phone;
    const user = await this.repository.save(User.fromDto(account.id, dto, options?.createdAt));

    if (dto.accessibleUserIds !== undefined) {
      user.accessibleUsers = await this.repositoryUAU.save(
        dto.accessibleUserIds.map((accessibleId) => new UsersAccessibleUsers(user.id, accessibleId)),
      );
    }

    if (dto.objectPermissions) {
      user.objectPermissions = await this.objectPermissionService.create({
        accountId: account.id,
        userId: user.id,
        hasDepartmentId: !!user.departmentId,
        dtos: dto.objectPermissions,
      });
    }

    this.eventEmitter.emit(IamEventType.UserCreated, new UserCreatedEvent({ accountId: account.id, userId: user.id }));

    return user;
  }

  async isEmailOccupied(email: string): Promise<boolean> {
    return (await this.getCount({ email })) > 0;
  }

  async findOne(filter: FindFilter, options?: FindOptions): Promise<User | null> {
    const qb = this.createFindQb(filter);
    if (filter.accountId && filter.id && !Array.isArray(filter.id)) {
      qb.cache(cacheKey({ accountId: filter.accountId, userId: filter.id }), 600000);
    }
    const user = await qb.getOne();

    return user && options?.expand ? this.expandOne({ account: options.account, user, expand: options.expand }) : user;
  }

  async findMany(filter: FindFilter, options?: FindOptions): Promise<User[]> {
    const users = await this.createFindQb(filter).orderBy('user.created_at', 'ASC').getMany();

    return users.length && options?.expand
      ? this.expandMany({ account: options.account, users, expand: options.expand })
      : users;
  }

  async getCount(filter: FindFilter): Promise<number> {
    return this.createFindQb(filter).getCount();
  }

  async getCoworkerIds({
    accountId,
    departmentIds,
  }: {
    accountId: number;
    departmentIds: number | number[] | null;
  }): Promise<number[]> {
    const cacheKey = `User.coworkers:${accountId}:${departmentIds}`;
    return (
      await this.createFindQb({ accountId, departmentId: departmentIds })
        .select('user.id', 'id')
        .cache(cacheKey, 15000)
        .getRawMany<{ id: number }>()
    ).map((u) => u.id);
  }

  async update({ accountId, userId, dto }: { accountId: number; userId: number; dto: UpdateUserDto }): Promise<User> {
    const user = await this.findOne({ accountId, id: userId });
    if (!user) {
      throw NotFoundError.withId(User, userId);
    }

    if (dto.email && dto.email !== user.email && (await this.isEmailOccupied(dto.email))) {
      throw EmailOccupiedError.fromEmail(dto.email);
    }

    await this.repository.save(user.update(dto));

    if (dto.accessibleUserIds !== undefined) {
      await this.repositoryUAU.delete({ userId });
      user.accessibleUsers = await this.repositoryUAU.save(
        dto.accessibleUserIds.map((accessibleId) => new UsersAccessibleUsers(userId, accessibleId)),
      );
    }

    if (dto.objectPermissions) {
      user.objectPermissions = await this.objectPermissionService.update({
        accountId: user.accountId,
        userId: user.id,
        hasDepartmentId: !!user.departmentId,
        dtos: dto.objectPermissions,
      });
    }

    this.dataSource.queryResultCache?.remove([cacheKey({ accountId, userId })]);

    return user;
  }

  async updateExt({ account, userId, dto }: { account: Account; userId: number; dto: UpdateUserDto }): Promise<User> {
    const user = await this.update({ accountId: account.id, userId, dto });

    return this.expandOne({ account, user, expand: ['avatarUrl'] });
  }

  async changeDepartment({
    accountId,
    departmentId,
    newDepartmentId,
  }: {
    accountId: number;
    departmentId: number;
    newDepartmentId?: number | null;
  }) {
    await this.repository.update({ accountId, departmentId }, { departmentId: newDepartmentId ?? null });
  }

  async changePassword({ user, dto }: { user: User; dto: ChangeUserPasswordDto }): Promise<boolean> {
    const isValidPassword = PasswordUtil.verify(dto.currentPassword, user.password);
    if (!isValidPassword) {
      throw new BadCredentialsError();
    }

    await this.repository.save(user.update({ password: dto.newPassword }));
    return true;
  }

  async ensureUserLimit({ accountId, user, userLimit }: { accountId: number; user: User | null; userLimit: number }) {
    const activeUsers = await this.findMany({ accountId, isActive: true });
    if (activeUsers.length > userLimit) {
      const owner = user ?? activeUsers.find((user) => user.role === UserRole.OWNER);
      const usersToDelete = activeUsers.sort((a, b) => a.id - b.id).slice(userLimit);
      for (const userToDelete of usersToDelete) {
        await this.softDelete({ accountId, user: owner, userId: userToDelete.id, newUserId: owner?.id });
      }
    }
  }

  async delete({ accountId, userId }: { accountId: number; userId: number | number[] }) {
    const ids = Array.isArray(userId) ? userId : [userId];
    await Promise.all(
      ids.map(async (id) => {
        await this.objectPermissionService.delete({ accountId, userId: id });
        await this.deleteAvatar({ accountId, userId: id });

        await this.repository.delete({ accountId, id });

        this.eventEmitter.emit(IamEventType.UserDeleted, new UserDeletedEvent({ accountId, userId: id }));
        this.dataSource.queryResultCache?.remove([cacheKey({ accountId, userId: id })]);
      }),
    );
  }

  async softDelete({
    accountId,
    user,
    userId,
    newUserId,
  }: {
    accountId: number;
    user: User;
    userId: number;
    newUserId?: number;
  }) {
    if (!user.isAdmin) {
      throw new ForbiddenError();
    }
    await this.repository.update({ accountId, id: userId }, { isActive: false });
    this.dataSource.queryResultCache?.remove([cacheKey({ accountId, userId })]);

    this.eventEmitter.emit(IamEventType.UserDeleted, new UserDeletedEvent({ accountId, userId, newUserId }));
  }

  async setAvatar({ account, userId, file }: { account: Account; userId: number; file: StorageFile }): Promise<User> {
    const user = await this.deleteAvatar({ accountId: account.id, userId });

    const avatarFileInfo = await this.storageService.storeUserFile({
      accountId: account.id,
      userId: user.id,
      file,
      section: 'avatar',
    });
    if (avatarFileInfo) {
      user.avatarId = avatarFileInfo.id;
      await this.repository.save(user);
      await this.storageService.markUsed({ accountId: account.id, id: avatarFileInfo.id });
    }

    return this.findOne({ accountId: account.id, id: userId }, { account, expand: ['avatarUrl', 'objectPermissions'] });
  }

  async removeAvatar({ account, userId }: { account: Account; userId: number }): Promise<User> {
    await this.deleteAvatar({ accountId: account.id, userId });

    return this.findOne({ accountId: account.id, id: userId }, { account, expand: ['avatarUrl', 'objectPermissions'] });
  }

  private async deleteAvatar({ accountId, userId }: { accountId: number; userId: number }) {
    const user = await this.findOne({ accountId, id: userId });
    if (user.avatarId) {
      if (await this.storageService.delete({ accountId: user.accountId, id: user.avatarId })) {
        user.avatarId = null;
        await this.repository.save(user);
      }
    }
    this.dataSource.queryResultCache?.remove([cacheKey({ accountId, userId })]);
    return user;
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository.createQueryBuilder('user').where('1 = 1');

    qb.leftJoinAndMapMany('user.accessibleUsers', 'users_accessible_users', 'uau', 'uau.user_id = user.id');

    if (filter.accountId) {
      qb.andWhere('user.account_id = :accountId', { accountId: filter.accountId });
    }

    if (filter.id) {
      if (Array.isArray(filter.id)) {
        qb.andWhere('user.id IN (:...ids)', { ids: filter.id });
      } else {
        qb.andWhere('user.id = :id', { id: filter.id });
      }
    }

    if (filter.email) {
      qb.andWhere('LOWER(user.email) = LOWER(:email)', { email: filter.email });
    }

    if (filter.isActive !== undefined) {
      qb.andWhere('user.is_active = :isActive', { isActive: filter.isActive });
    }

    if (filter.departmentId) {
      if (Array.isArray(filter.departmentId) && filter.departmentId.length) {
        qb.andWhere('user.department_id IN (:...departmentIds)', { departmentIds: filter.departmentId });
      } else {
        qb.andWhere('user.department_id = :departmentId', { departmentId: filter.departmentId });
      }
    }

    if (filter.role) {
      qb.andWhere('user.role = :role', { role: filter.role });
    }

    if (filter.fullName) {
      qb.andWhere(`LOWER(user.first_name || ' ' || user.last_name) ilike :fullName`, {
        fullName: `%${filter.fullName.trim()}%`,
      });
    }

    return qb;
  }

  private async expandOne({
    account,
    user,
    expand,
  }: {
    account: Account;
    user: User;
    expand: ExpandableField[];
  }): Promise<User> {
    if (user.avatarId && expand.includes('avatarUrl')) {
      user.avatarUrl = this.storageUrlService.getImageUrl(account.id, account.subdomain, user.avatarId);
    }
    if (expand.includes('objectPermissions')) {
      user.objectPermissions = await this.objectPermissionService.findMany({ accountId: account.id, userId: user.id });
    }
    return user;
  }
  private async expandMany({
    account,
    users,
    expand,
  }: {
    account: Account;
    users: User[];
    expand: ExpandableField[];
  }): Promise<User[]> {
    return await Promise.all(users.map((user) => this.expandOne({ account, user, expand })));
  }
}
