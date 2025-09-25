import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { DateUtil, PasswordUtil } from '@/common';

import { UserRole } from '../../common';
import { ObjectPermission } from '../../object-permission/entities';
import { CreateUserDto, UpdateUserDto, UserDto } from '../dto';
import { UsersAccessibleUsers } from './users-accessible-users.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string | null;

  @Column()
  password: string;

  @Column()
  role: UserRole;

  @Column({ nullable: true })
  avatarId: string | null;

  @Column()
  isActive: boolean;

  @Column({ default: false })
  isPlatformAdmin: boolean;

  @Column({ nullable: true })
  departmentId: number | null;

  @Column({ nullable: true })
  position: string | null;

  @Column()
  analyticsId: string;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: UserRole,
    isActive: boolean,
    departmentId: number | null,
    position: string | null,
    avatarId: string | null,
    phone: string | null,
    analyticsId: string,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.avatarId = avatarId;
    this.password = password;
    this.role = role;
    this.isActive = isActive;
    this.departmentId = departmentId;
    this.position = position;
    this.analyticsId = analyticsId;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _avatarUrl: string | null;
  public get avatarUrl(): string | null {
    return this._avatarUrl;
  }
  public set avatarUrl(value: string | null) {
    this._avatarUrl = value;
  }

  private _objectPermissions: ObjectPermission[] | null;
  public get objectPermissions(): ObjectPermission[] | null {
    return this._objectPermissions;
  }
  public set objectPermissions(value: ObjectPermission[] | null) {
    this._objectPermissions = value;
  }

  private _accessibleUsers: UsersAccessibleUsers[] | null;
  public get accessibleUsers(): UsersAccessibleUsers[] | null {
    return this._accessibleUsers;
  }
  public set accessibleUsers(value: UsersAccessibleUsers[] | null) {
    this._accessibleUsers = value;
  }

  public static fromDto(accountId: number, dto: CreateUserDto, createdAt?: Date): User {
    return new User(
      accountId,
      dto.firstName?.trim(),
      dto.lastName?.trim(),
      dto.email.trim(),
      PasswordUtil.hash(dto.password),
      dto.role,
      dto.isActive ?? true,
      dto.departmentId,
      dto.position,
      null,
      dto.phone,
      dto.analyticsId ?? uuidv4(),
      createdAt,
    );
  }

  public update(dto: UpdateUserDto): User {
    this.firstName = dto.firstName !== undefined ? (dto.firstName ?? '').trim() : this.firstName;
    this.lastName = dto.lastName !== undefined ? (dto.lastName ?? '').trim() : this.lastName;
    this.email = dto.email !== undefined ? (dto.email ?? '').trim() : this.email;
    this.phone = dto.phone !== undefined ? dto.phone : this.phone;
    this.role = dto.role !== undefined ? dto.role : this.role;
    this.isActive = dto.isActive !== undefined ? dto.isActive : this.isActive;
    this.departmentId = dto.departmentId !== undefined ? dto.departmentId : this.departmentId;
    this.position = dto.position !== undefined ? dto.position : this.position;

    if (dto.password) {
      this.password = PasswordUtil.hash(dto.password);
    }

    return this;
  }

  public get fullName() {
    return `${this.firstName} ${this.lastName ?? ''}`.trim();
  }

  public get isAdmin() {
    return this.role === UserRole.ADMIN || this.role === UserRole.OWNER;
  }

  public toDto(): UserDto {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      role: this.role,
      isActive: this.isActive,
      departmentId: this.departmentId,
      position: this.position,
      avatarUrl: this.avatarUrl,
      analyticsId: this.analyticsId,
      objectPermissions: this.objectPermissions?.map((op) => op.toDto()),
      accessibleUserIds: this.accessibleUsers?.map((au) => au.accessibleId),
      isPlatformAdmin: this.isPlatformAdmin,
    };
  }
}
