import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { ForbiddenError, DateUtil } from '@/common';
import { ApplicationConfig } from '@/config';

import { AccountService } from '@/modules/iam/account/account.service';
import { AuthenticationService } from '@/modules/iam/authentication/authentication.service';
import { LoginLinkDto } from '@/modules/iam/authentication/dto/login-link.dto';
import { UserService } from '@/modules/iam/user/user.service';

import { TestAccount } from './entities/test-account.entity';
import { CreateTestAccountsQuery } from './dto/create-test-accounts-query';

@Injectable()
export class TestDataService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(TestAccount)
    private readonly repository: Repository<TestAccount>,
    private readonly authService: AuthenticationService,
    private readonly accountService: AccountService,
    private readonly userService: UserService,
  ) {}

  public async loginTestUser(): Promise<LoginLinkDto | null> {
    const testAccountCount = await this.repository.count();
    const testAccountNumber = Math.floor(Math.random() * testAccountCount);
    const testAccount = await this.repository.find({ skip: testAccountNumber, take: 1 });

    if (testAccount.length) {
      const account = await this.accountService.findOne({ accountId: testAccount[0].accountId });
      const users = await this.userService.findMany({ accountId: account.id, isActive: true });
      const testUserNumber = Math.floor(Math.random() * users.length);
      const user = users[testUserNumber];
      return this.authService.createLoginLink({ accountId: account.id, subdomain: account.subdomain, userId: user.id });
    }

    return null;
  }

  public async createTestAccounts(query: CreateTestAccountsQuery) {
    const verificationToken = this.configService.get<ApplicationConfig>('application').verificationToken;
    if (!verificationToken || !query.token || verificationToken !== query.token) {
      throw new ForbiddenError('Invalid verification token');
    }

    const dates = this.generateRandomDates(query.fromDate, query.toDate, query.count);
    for (let i = 0; i < query.count; i++) {
      await this.createTestAccount(dates[i]);
    }
  }

  private async createTestAccount(createdAt: Date): Promise<boolean> {
    try {
      const sexType = faker.person.sexType();
      const firstName = faker.person.firstName(sexType);
      const lastName = faker.person.lastName(sexType);
      const email = faker.internet.email({ firstName, lastName });
      const { account } = await this.accountService.create(
        {
          firstName,
          lastName,
          email,
          phone: faker.phone.number(),
          password: email,
          companyName: faker.company.name(),
        },
        {
          skipPhoneCheck: true,
          createdAt: createdAt,
          subscription: { isTrial: false, termInDays: 3650 },
        },
      );
      await this.repository.save({ accountId: account.id });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
  }

  private generateRandomDates(fromDate: string, toDate: string, count: number): Date[] {
    const start = DateUtil.fromISOString(fromDate).getTime();
    const end = DateUtil.fromISOString(toDate).getTime();

    return Array.from({ length: count }, () => {
      const skew = Math.random() ** 1.618;
      const skewedTimestamp = start + (1 - skew) * (end - start);
      return new Date(skewedTimestamp);
    }).sort((a, b) => a.getTime() - b.getTime());
  }
}
