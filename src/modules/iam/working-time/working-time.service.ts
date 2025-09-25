import { Injectable } from '@nestjs/common';

import { AccountSettingsService } from '../account-settings/account-settings.service';
import { DepartmentSettingsService } from '../department-settings/department-settings.service';
import { UserService } from '../user/user.service';
import { UserProfileService } from '../user-profile/user-profile.service';

interface WorkingTime {
  timeZone: string | null;
  workingDays: string[] | null;
  workingTimeFrom: string | null;
  workingTimeTo: string | null;
}

@Injectable()
export class WorkingTimeService {
  constructor(
    private readonly accountSettingsService: AccountSettingsService,
    private readonly departmentSettingsService: DepartmentSettingsService,
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
  ) {}

  async getForUser({ accountId, userId }: { accountId: number; userId: number }): Promise<WorkingTime> {
    const settings = await this.accountSettingsService.getOne(accountId);
    const workingTime = {
      timeZone: settings.timeZone,
      workingDays: settings.workingDays,
      workingTimeFrom: settings.workingTimeFrom,
      workingTimeTo: settings.workingTimeTo,
    };

    const user = await this.userService.findOne({ accountId, id: userId });
    if (user?.departmentId) {
      const depSettings = await this.departmentSettingsService.findOne({ accountId, departmentId: user.departmentId });
      if (depSettings) {
        if (depSettings.workingDays) {
          workingTime.workingDays = depSettings.workingDays;
        }
        if (depSettings.workingTimeFrom) {
          workingTime.workingTimeFrom = depSettings.workingTimeFrom;
        }
        if (depSettings.workingTimeTo) {
          workingTime.workingTimeTo = depSettings.workingTimeTo;
        }
      }
    }

    const profile = await this.userProfileService.findOne({ accountId, userId });
    if (profile) {
      if (profile.workingTimeFrom) {
        workingTime.workingTimeFrom = profile.workingTimeFrom;
      }
      if (profile.workingTimeTo) {
        workingTime.workingTimeTo = profile.workingTimeTo;
      }
    }

    return workingTime;
  }

  async getForDepartment({
    accountId,
    departmentId,
  }: {
    accountId: number;
    departmentId: number;
  }): Promise<WorkingTime> {
    const settings = await this.accountSettingsService.getOne(accountId);
    const workingTime = {
      timeZone: settings.timeZone,
      workingDays: settings.workingDays,
      workingTimeFrom: settings.workingTimeFrom,
      workingTimeTo: settings.workingTimeTo,
    };

    const depSettings = await this.departmentSettingsService.findOne({ accountId, departmentId });
    if (depSettings.workingDays) {
      workingTime.workingDays = depSettings.workingDays;
    }
    if (depSettings.workingTimeFrom) {
      workingTime.workingTimeFrom = depSettings.workingTimeFrom;
    }
    if (depSettings.workingTimeTo) {
      workingTime.workingTimeTo = depSettings.workingTimeTo;
    }

    return workingTime;
  }
}
