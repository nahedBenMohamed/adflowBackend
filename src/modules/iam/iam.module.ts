import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageModule } from '@/modules/storage/storage.module';

import { Account } from './account/entities/account.entity';
import { AccountService } from './account/account.service';
import { AccountController } from './account/account.controller';

import { AccountApiAccess, AccountApiAccessService } from './account-api-access';
import { AccountApiAccessController } from './account-api-access/account-api-access.controller';

import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';

import { AuthorizationService } from './authorization/authorization.service';

import { ObjectPermission, ObjectPermissionService } from './object-permission';

import { AccountSubscription, AccountSubscriptionController, AccountSubscriptionService } from './account-subscription';

import { UserProfile } from './user-profile/entities/user-profile.entity';
import { UserProfileService } from './user-profile/user-profile.service';
import { UserProfileController } from './user-profile/user-profile.controller';

import { User, UsersAccessibleUsers } from './user/entities';
import { UserHandler } from './user/user.handler';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';

import { AccountSettings, AccountSettingsController, AccountSettingsService } from './account-settings';
import { Department, DepartmentController, DepartmentService } from './department';
import { DepartmentSettings, DepartmentSettingsController, DepartmentSettingsService } from './department-settings';
import {
  PublicSubscriptionDiscountController,
  SubscriptionDiscount,
  SubscriptionDiscountController,
  SubscriptionDiscountService,
} from './subscription-discount';
import { UserToken, UserTokenController, UserTokenService } from './user-token';
import {
  UserCalendar,
  UserCalendarController,
  UserCalendarInterval,
  UserCalendarIntervalService,
  UserCalendarService,
} from './user-calendar';
import { WorkingTimeService } from './working-time';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      AccountApiAccess,
      AccountSettings,
      Department,
      DepartmentSettings,
      ObjectPermission,
      AccountSubscription,
      SubscriptionDiscount,
      User,
      UsersAccessibleUsers,
      UserCalendar,
      UserCalendarInterval,
      UserProfile,
      UserToken,
    ]),
    forwardRef(() => StorageModule),
  ],
  controllers: [
    AccountController,
    AccountSettingsController,
    AccountApiAccessController,
    AuthenticationController,
    DepartmentController,
    DepartmentSettingsController,
    AccountSubscriptionController,
    UserController,
    UserProfileController,
    SubscriptionDiscountController,
    PublicSubscriptionDiscountController,
    UserTokenController,
    UserCalendarController,
  ],
  providers: [
    AccountService,
    AccountApiAccessService,
    AccountSettingsService,
    AuthenticationService,
    AuthorizationService,
    DepartmentService,
    DepartmentSettingsService,
    ObjectPermissionService,
    AccountSubscriptionService,
    SubscriptionDiscountService,
    UserService,
    UserHandler,
    UserProfileService,
    UserTokenService,
    UserCalendarService,
    UserCalendarIntervalService,
    WorkingTimeService,
  ],
  exports: [
    AccountService,
    AccountApiAccessService,
    AccountSettingsService,
    AccountSubscriptionService,
    AuthorizationService,
    AuthenticationService,
    DepartmentService,
    ObjectPermissionService,
    SubscriptionDiscountService,
    UserService,
    UserTokenService,
    UserCalendarService,
    WorkingTimeService,
  ],
})
export class IAMModule {}
