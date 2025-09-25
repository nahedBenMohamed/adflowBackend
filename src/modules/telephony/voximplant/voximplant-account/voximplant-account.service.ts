import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import VoximplantApiClient from '@amwork/voximplant-apiclient-nodejs';

import { NotFoundError } from '@/common';
import { ApplicationConfig } from '@/config';

import { Account } from '@/modules/iam/account/entities/account.entity';

import { VoximplantCoreService } from '../voximplant-core';

import { VoximplantAccount } from './entities';
import { VoximplantApplicationParam } from '../common';

@Injectable()
export class VoximplantAccountService {
  private _appName: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(VoximplantAccount)
    private readonly repository: Repository<VoximplantAccount>,
    private readonly viCoreService: VoximplantCoreService,
  ) {
    this._appName = this.configService.get<ApplicationConfig>('application').name;
  }

  public async getClient(
    account: number | VoximplantAccount,
  ): Promise<{ client: VoximplantApiClient; appParam: VoximplantApplicationParam }> {
    const viAccount = account instanceof VoximplantAccount ? account : await this.getOne(account);

    const client = new VoximplantApiClient({
      account_email: viAccount.accountEmail,
      account_id: viAccount.externalId,
      key_id: viAccount.keyId,
      private_key: viAccount.privateKey,
    });
    const appParam = {
      applicationId: viAccount.applicationId,
      applicationName: viAccount.applicationName,
    };

    return { client, appParam };
  }

  public async create(account: Account): Promise<VoximplantAccount> {
    const viAccount = await this.repository.findOneBy({ accountId: account.id });
    if (viAccount) {
      return viAccount.isActive ? viAccount : await this.setActive(viAccount, true);
    }

    const extAccount = await this.viCoreService.createChildAccount(account);
    if (extAccount) {
      const newAccount = new VoximplantAccount(
        account.id,
        extAccount.accountId,
        extAccount.accountName,
        extAccount.accountEmail,
        extAccount.apiKey,
        extAccount.password,
        extAccount.billingAccountId,
        extAccount.active,
        extAccount.key.keyId,
        extAccount.key.privateKey,
        0,
        '',
      );

      const { client } = await this.getClient(newAccount);
      const { result, applicationId, applicationName } = await client.Applications.addApplication({
        applicationName: this._appName,
      });
      if (result) {
        return await this.repository.save(
          new VoximplantAccount(
            account.id,
            extAccount.accountId,
            extAccount.accountName,
            extAccount.accountEmail,
            extAccount.apiKey,
            extAccount.password,
            extAccount.billingAccountId,
            extAccount.active,
            extAccount.key.keyId,
            extAccount.key.privateKey,
            applicationId,
            applicationName,
          ),
        );
      }
    }
    return null;
  }

  public async findOne(accountId: number): Promise<VoximplantAccount | null> {
    return await this.repository.findOneBy({ accountId });
  }

  public async findOneExt(filter: { applicationId: number }): Promise<VoximplantAccount | null> {
    return await this.repository.findOneBy({ applicationId: filter.applicationId });
  }

  public async getOne(accountId: number): Promise<VoximplantAccount> {
    const viAccount = await this.repository.findOneBy({ accountId });
    if (!viAccount) {
      throw NotFoundError.withId(VoximplantAccount, accountId);
    }

    return viAccount;
  }

  public async markActive(accountId: number, isActive: boolean): Promise<VoximplantAccount> {
    const viAccount = await this.getOne(accountId);
    return await this.setActive(viAccount, isActive);
  }

  private async setActive(viAccount: VoximplantAccount, isActive: boolean): Promise<VoximplantAccount> {
    const result = await this.viCoreService.setActiveChildAccount(
      viAccount.externalId,
      viAccount.accountName,
      viAccount.accountEmail,
      isActive,
    );

    if (result) {
      viAccount.isActive = isActive;
      return await this.repository.save(viAccount);
    }

    return viAccount;
  }
}
