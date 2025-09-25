import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import VoximplantApiClient from '@voximplant/apiclient-nodejs';

import { PasswordUtil } from '@/common';
import { ApplicationConfig } from '@/config';

import { AccountSettingsService } from '@/modules/iam/account-settings/account-settings.service';
import { UserService } from '@/modules/iam/user/user.service';
import { Account } from '@/modules/iam/account/entities/account.entity';
import { UserRole } from '@/modules/iam/common/enums/user-role.enum';

import { VoximplantConfig } from '../config/voximplant.config';

const VoximplantUrls = {
  base: 'https://api.voximplant.com/platform_api',
  addAccount: () => `${VoximplantUrls.base}/AddAccount`,
  createKey: () => `${VoximplantUrls.base}/CreateKey`,
} as const;

const VOXIMPLANT_ACCOUNT_NAME_MAX = 20;

interface Key {
  keyId: string;
  privateKey: string;
}
interface ChildAccount {
  accountId: number;
  accountName: string;
  accountEmail: string;
  apiKey: string;
  password: string;
  billingAccountId: number;
  active: boolean;
  key: Key;
}

@Injectable()
export class VoximplantCoreService {
  private readonly logger = new Logger(VoximplantCoreService.name);
  private _appName: string;
  private _viConfig: VoximplantConfig;

  private client: VoximplantApiClient;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly accountSettingsService: AccountSettingsService,
    private readonly userService: UserService,
  ) {
    this._appName = this.configService.get<ApplicationConfig>('application').name;
    this._viConfig = this.configService.get<VoximplantConfig>('voximplant');

    const credentialsPath = `${process.cwd()}${this._viConfig.credentialsFile}`;
    this.client = new VoximplantApiClient(credentialsPath);
  }

  public async createChildAccount(account: Account): Promise<ChildAccount | null> {
    const accountSettings = await this.accountSettingsService.getOne(account.id);
    const owner = await this.userService.findOne({ accountId: account.id, role: UserRole.OWNER });
    const accountName = `${this._appName}-${account.subdomain}`.substring(0, VOXIMPLANT_ACCOUNT_NAME_MAX).toLowerCase();
    try {
      const params = {
        parent_account_id: this._viConfig.accountId,
        parent_account_api_key: this._viConfig.accountApiKey,
        account_name: accountName,
        account_email: owner.email,
        account_password: PasswordUtil.generateSecure(),
        active: true,
        language_code: accountSettings.language,
        location: accountSettings.timeZone,
        account_notifications: true,
        tariff_changing_notifications: true,
        min_balance_to_notify: 100,
        Authorization: this.client.generateAuthHeader(),
      };
      const { data } = await lastValueFrom(this.httpService.post(VoximplantUrls.addAccount(), {}, { params }));
      if (data.result === 1) {
        const key = await this.createKey(data.account_id, data.api_key);
        if (key) {
          return {
            accountId: data.account_id,
            accountName: params.account_name,
            accountEmail: params.account_email,
            apiKey: data.api_key,
            password: params.account_password,
            billingAccountId: data.billing_account_id,
            active: data.active,
            key,
          };
        }
      } else {
        this.logger.error(`Create child account error: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      this.logger.error(`Create child account error`, (e as Error)?.stack);
    }
    return null;
  }

  public async getChildrenAccounts() {
    return await this.client.Accounts.getChildrenAccounts({});
  }

  public async setActiveChildAccount(
    childAccountId: number,
    childAccountName: string,
    childAccountEmail: string,
    isActive: boolean,
  ): Promise<boolean> {
    const { result } = await this.client.Accounts.setChildAccountInfo({
      childAccountId,
      childAccountName,
      childAccountEmail,
      active: isActive,
    });

    return result === 1;
  }

  private async createKey(accountId: number, apiKey: string): Promise<Key | null> {
    try {
      const params = {
        account_id: accountId,
        api_key: apiKey,
        description: `${this._appName} Integration`,
        role_name: 'Owner',
      };
      const { data } = await lastValueFrom(this.httpService.post(VoximplantUrls.createKey(), {}, { params }));
      if (data.result) {
        return {
          keyId: data.result.key_id,
          privateKey: data.result.private_key,
        };
      }
    } catch (e) {
      this.logger.error(`Create key error`, (e as Error)?.stack);
    }
    return null;
  }

  public async getKeys() {
    const { result: keys } = await this.client.RoleSystem.getKeys({});
    const { result: roles } = await this.client.RoleSystem.getRoles({});

    return { roles, keys };
  }
}
