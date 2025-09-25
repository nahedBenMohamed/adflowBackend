import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import slugify from 'slugify';

import { ApplicationConfig } from '@/config';
import { ForbiddenError, PagingQuery } from '@/common';

import { StorageUrlService } from '@/modules/storage/storage-url.service';
import { StorageService } from '@/modules/storage/storage.service';
import { StorageFile } from '@/modules/storage/types/storage-file';

import { IamEventType, AccountCreatedEvent, UserRole } from '../common';

import { AccountSettingsService } from '../account-settings/account-settings.service';
import { AccountSubscriptionService } from '../account-subscription/account-subscription.service';
import { User } from '../user/entities/user.entity';
import { EmailOccupiedError } from '../user/errors/email-occupied.error';
import { UserService } from '../user/user.service';

import { CreateAccountDto } from './dto';
import { Account } from './entities';
import { ExpandableField } from './types';

const MIN_SUBDOMAIN_LENGTH = 3;
const MAX_SUBDOMAIN_LENGTH = 30;

interface SubscriptionOptions {
  termInDays?: number;
  userLimit?: number;
  planName?: string;
  isTrial?: boolean;
}

interface CreateOptions {
  gaClientId?: string | null;
  skipPhoneCheck?: boolean;
  createdAt?: Date;
  subscription?: SubscriptionOptions;
  firstVisit?: string | null;
}

interface FindFilter {
  accountId?: number;
  subdomain?: string;
  search?: string;
}

const cacheKey = (accountId: number) => `Account:${accountId}`;

@Injectable()
export class AccountService {
  private _subdomainPrefix: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Account)
    private readonly repository: Repository<Account>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly subscriptionService: AccountSubscriptionService,
    @Inject(forwardRef(() => StorageService))
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => StorageUrlService))
    private readonly storageUrlService: StorageUrlService,
    private readonly accountSettingsService: AccountSettingsService,
  ) {
    this._subdomainPrefix = this.configService.get<ApplicationConfig>('application').subdomainPrefix;
  }

  async create(dto: CreateAccountDto, options?: CreateOptions): Promise<{ account: Account; owner: User }> {
    if (await this.userService.isEmailOccupied(dto.email)) {
      throw EmailOccupiedError.forAccountCreation();
    }

    dto.companyName = dto.companyName ? dto.companyName.trim() : this.createRandomSubdomain();
    const subdomain = await this.generateSubdomain(dto.companyName);
    const account = await this.repository.save(new Account(dto.companyName, subdomain, null, options?.createdAt));

    const owner = await this.userService.create({
      account,
      dto: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: dto.password,
        role: UserRole.OWNER,
        phone: dto.phone,
        analyticsId: dto.userAnalyticsId,
      },
      options,
    });

    const subscription = await this.subscriptionService.create(account.id, {
      createdAt: options?.createdAt?.toISOString(),
      ...(options?.subscription || []),
      firstVisit: options?.firstVisit,
    });
    await this.accountSettingsService.create(account.id, dto.settings);

    this.eventEmitter.emit(
      IamEventType.AccountCreated,
      new AccountCreatedEvent({
        accountId: account.id,
        name: `${owner.firstName} ${owner.lastName}`,
        email: owner.email,
        phone: owner.phone,
        companyName: account.companyName,
        subdomain: account.subdomain,
        ownerId: owner.id,
        createdAt: account.createdAt.toISOString(),
        subscriptionName: subscription.isTrial ? 'Trial' : subscription.planName,
        gaClientId: options?.gaClientId,
        gaUserId: owner.analyticsId,
      }),
    );

    return { account, owner };
  }

  async findOne(filter: FindFilter): Promise<Account | null> {
    const qb = this.createFindQb(filter);
    if (filter.accountId) {
      qb.cache(cacheKey(filter.accountId), 86400000);
    }

    return qb.getOne();
  }

  async searchSystem({
    user,
    filter,
    paging,
  }: {
    user: User;
    filter: FindFilter;
    paging: PagingQuery;
  }): Promise<Account[]> {
    if (!user.isPlatformAdmin) {
      throw new ForbiddenError();
    }
    return this.createFindQb(filter).offset(paging.skip).limit(paging.take).getMany();
  }

  async expandOne(account: Account, expand: ExpandableField[]): Promise<Account> {
    if (expand.includes('logoUrl') && account.logoId) {
      account.logoUrl = this.storageUrlService.getImageUrl(account.id, account.subdomain, account.logoId);
    }
    return account;
  }

  async setLogo(account: Account, userId: number, file: Express.Multer.File): Promise<Account> {
    const updatedAccount = await this.deleteLogo(account);
    const logoFileInfo = await this.storageService.storeAccountFile({
      accountId: updatedAccount.id,
      userId,
      file: StorageFile.fromMulter(file),
      section: 'logo',
    });
    if (logoFileInfo) {
      updatedAccount.logoId = logoFileInfo.id;
      updatedAccount.logoUrl = this.storageUrlService.getImageUrl(account.id, account.subdomain, account.logoId);
      this.dataSource.queryResultCache?.remove([cacheKey(account.id)]);
      await this.repository.save(updatedAccount);
      await this.storageService.markUsed({ accountId: updatedAccount.id, id: logoFileInfo.id });
    }

    return updatedAccount;
  }

  async deleteLogo(account: Account): Promise<Account> {
    if (account.logoId) {
      if (await this.storageService.delete({ accountId: account.id, id: account.logoId })) {
        account.logoId = null;
        account.logoUrl = null;
        this.dataSource.queryResultCache?.remove([cacheKey(account.id)]);
        return await this.repository.save(account);
      }
    }
    return account;
  }

  private async generateSubdomain(companyName: string): Promise<string> {
    const slug = this.generateSlug(companyName);

    let subdomain = slug.substring(0, MAX_SUBDOMAIN_LENGTH);
    if (!this.isValidSubdomain(subdomain)) {
      subdomain = this.createRandomSubdomain();
    }

    while (!(await this.isSubdomainFree(subdomain))) {
      subdomain = this.createRandomSubdomain();
    }

    return subdomain;
  }

  private generateSlug(inputStr: string): string {
    return slugify(inputStr, {
      replacement: '-',
      strict: true,
      lower: true,
      trim: true,
    });
  }

  private async isSubdomainFree(subdomain: string): Promise<boolean> {
    return (await this.repository.countBy({ subdomain })) === 0;
  }

  private isValidSubdomain(subdomain: string): boolean {
    return subdomain.length >= MIN_SUBDOMAIN_LENGTH && subdomain.length <= MAX_SUBDOMAIN_LENGTH;
  }

  private createRandomSubdomain(): string {
    return `${this._subdomainPrefix}-${Math.floor(Math.random() * 98998 + 1001)}`.toLowerCase();
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository.createQueryBuilder();

    if (filter.accountId) {
      qb.andWhere('id = :accountId', { accountId: filter.accountId });
    }
    if (filter.subdomain) {
      qb.andWhere('subdomain = :subdomain', { subdomain: filter.subdomain });
    }
    if (filter.search) {
      qb.andWhere('subdomain ILIKE :search', { search: `%${filter.search}%` });
    }

    return qb;
  }
}
