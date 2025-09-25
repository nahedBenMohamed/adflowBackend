import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DateUtil, ForbiddenError, NotFoundError } from '@/common';

import { UserService } from '@/modules/iam/user/user.service';
import { User } from '@/modules/iam/user/entities/user.entity';

import { CreateAccountSubscriptionDto, UpdateAccountSubscriptionDto } from './dto';
import { AccountSubscription } from './entities';

type SubscriptionIdentifier =
  | { accountId: number; externalCustomerId?: string }
  | { accountId?: number; externalCustomerId: string };

@Injectable()
export class AccountSubscriptionService {
  constructor(
    @InjectRepository(AccountSubscription)
    private readonly repository: Repository<AccountSubscription>,
    private readonly userService: UserService,
  ) {}

  async create(accountId: number, dto?: CreateAccountSubscriptionDto): Promise<AccountSubscription> {
    return this.repository.save(AccountSubscription.create(accountId, dto));
  }

  async get(accountId: number): Promise<AccountSubscription> {
    const subscription = await this.repository.findOne({ where: { accountId } });
    if (!subscription) {
      throw NotFoundError.withId(AccountSubscription, accountId);
    }
    return subscription;
  }
  async getSystem(accountId: number, user: User): Promise<AccountSubscription> {
    if (!user.isPlatformAdmin) {
      throw new ForbiddenError();
    }
    const subscription = await this.repository.findOne({ where: { accountId } });
    if (!subscription) {
      throw NotFoundError.withId(AccountSubscription, accountId);
    }
    return subscription;
  }

  async update(
    { accountId, externalCustomerId }: SubscriptionIdentifier,
    user: User | null,
    dto: UpdateAccountSubscriptionDto,
  ): Promise<AccountSubscription> {
    const subscription = accountId
      ? await this.get(accountId)
      : externalCustomerId
        ? await this.repository.findOneBy({ externalCustomerId })
        : null;

    if (subscription) {
      await this.repository.save(subscription.update(dto));
      await this.userService.ensureUserLimit({
        accountId: subscription.accountId,
        user,
        userLimit: subscription.userLimit,
      });
    }

    return subscription;
  }

  async updateSystem(accountId: number, user: User, dto: UpdateAccountSubscriptionDto): Promise<AccountSubscription> {
    const subscription = await this.getSystem(accountId, user);

    if (subscription) {
      await this.repository.save(subscription.update(dto));
      await this.userService.ensureUserLimit({
        accountId: subscription.accountId,
        user: null,
        userLimit: subscription.userLimit,
      });
    }

    return subscription;
  }

  async cancel(identifier: SubscriptionIdentifier): Promise<AccountSubscription> {
    return this.update(identifier, null, { periodEnd: DateUtil.now().toISOString() });
  }
}
