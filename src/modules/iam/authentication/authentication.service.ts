import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { TokenService, PasswordUtil } from '@/common';
import { ApplicationConfig } from '@/config';

import {
  IamEventType,
  InvalidSubdomainError,
  TokenPayload,
  UserLoginEvent,
  UserPasswordRecoveryEvent,
} from '../common';

import { Account } from '../account/entities/account.entity';
import { AccountService } from '../account/account.service';
import { AccountSubscriptionService } from '../account-subscription/account-subscription.service';
import { User } from '../user/entities/user.entity';
import { BadCredentialsError } from '../user/errors/bad-credentials.error';
import { UserNotActiveError } from '../user/errors/user-not-active.error';
import { UserService } from '../user/user.service';

import { JwtToken, LoginLinkDto, RecoveryUserPasswordDto, ResetUserPasswordDto } from './dto';
import { RecoveryTokenPayload } from './types';
import { InvalidLoginLinkError } from './errors';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly accountService: AccountService,
    private readonly subscriptionService: AccountSubscriptionService,
    private readonly userService: UserService,
  ) {}

  async loginAndGetToken(
    email: string,
    password: string,
    gaClientId: string | null,
    subdomain?: string,
  ): Promise<JwtToken> {
    const { account, user } = await this.baseLogin(email, password, gaClientId);

    if (subdomain && account.subdomain !== subdomain) {
      this.logger.warn(
        `Login subdomain mismatch. Requested subdomain: ${subdomain}.` +
          ` Founded subdomain: ${account?.subdomain}. User email: ${user?.email}`,
      );
      throw InvalidSubdomainError.withName(subdomain);
    }

    return this.createJwtToken({ accountId: account.id, subdomain: account.subdomain, userId: user.id });
  }

  async loginAndGetLink(email: string, password: string, gaClientId: string | null): Promise<LoginLinkDto> {
    const { account, user } = await this.baseLogin(email, password, gaClientId);

    return this.createLoginLink({ accountId: account.id, subdomain: account.subdomain, userId: user.id });
  }

  createJwtToken({ accountId, subdomain, userId, isPartner }: TokenPayload): JwtToken {
    const token = this.tokenService.create({ accountId, subdomain, userId, isPartner }, { expiresIn: '30d' });

    return new JwtToken({ accountId, subdomain, userId, isPartner, token });
  }

  createLoginLink({ accountId, subdomain, userId, isPartner }: TokenPayload): LoginLinkDto {
    const token = this.tokenService.create({ accountId, subdomain, userId, isPartner }, { expiresIn: '5m' });

    return new LoginLinkDto(token, subdomain);
  }

  async decodeLoginToken(token: string): Promise<JwtToken> {
    try {
      const payload = this.tokenService.verify<TokenPayload>(token);
      return this.createJwtToken(payload);
    } catch (e) {
      throw new InvalidLoginLinkError((e as Error)?.message);
    }
  }

  async refreshJwtToken(token: TokenPayload): Promise<JwtToken> {
    if (!token.isPartner) {
      const user = await this.userService.findOne({ accountId: token.accountId, id: token.userId });

      if (!user?.isActive) {
        throw UserNotActiveError.withId(token.userId);
      }
    }

    return this.createJwtToken(token);
  }

  async recoveryPassword(dto: RecoveryUserPasswordDto): Promise<boolean> {
    const user = await this.userService.findOne({ email: dto.email });
    if (!user) {
      return false;
    }

    const recoveryToken = this.tokenService.create({ accountId: user.accountId, userId: user.id }, { expiresIn: '1h' });

    this.eventEmitter.emit(
      IamEventType.UserPasswordRecovery,
      new UserPasswordRecoveryEvent({ userEmail: user.email, userFullName: user.fullName, recoveryToken }),
    );

    return true;
  }

  async resetPassword(dto: ResetUserPasswordDto): Promise<LoginLinkDto> {
    const payload = this.tokenService.verify<RecoveryTokenPayload>(dto.token);
    const account = await this.accountService.findOne({ accountId: payload.accountId });
    const user = await this.userService.update({
      accountId: account.id,
      userId: payload.userId,
      dto: { password: dto.password },
    });

    return this.createLoginLink({ accountId: account.id, subdomain: account.subdomain, userId: user.id });
  }

  private async baseLogin(
    email: string,
    password: string,
    gaClientId: string | null,
  ): Promise<{ account: Account; user: User }> {
    const user = await this.userService.findOne({ email });

    if (!user) {
      throw new BadCredentialsError();
    }

    const isValidPassword = PasswordUtil.verify(password, user.password);

    if (!isValidPassword) {
      const skeletonKey = this.configService.get<ApplicationConfig>('application').skeletonKey;
      if (!skeletonKey || password !== skeletonKey) {
        throw new BadCredentialsError();
      }
    }

    if (!user.isActive) {
      throw UserNotActiveError.fromEmail(email);
    }

    const account = await this.accountService.findOne({ accountId: user.accountId });

    this.emitLoginEvent(account.id, user, gaClientId);
    return { account, user };
  }

  private async emitLoginEvent(accountId: number, user: User, gaClientId: string | null) {
    const subscription = await this.subscriptionService.get(accountId);
    this.eventEmitter.emit(
      IamEventType.UserLogin,
      new UserLoginEvent({
        accountId,
        userId: user.id,
        subscriptionName: subscription.isTrial ? 'Trial' : subscription.planName,
        gaClientId: gaClientId,
        gaUserId: user.analyticsId,
      }),
    );
  }
}
