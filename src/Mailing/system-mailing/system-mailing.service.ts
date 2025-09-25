import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';

import { UrlGeneratorService } from '@/common';
import { ApplicationConfig } from '@/config';

import { IamEventType, UserPasswordRecoveryEvent } from '@/modules/iam/common';
import { Account } from '@/modules/iam/account/entities/account.entity';
import { User } from '@/modules/iam/user/entities/user.entity';

import { SendFeedbackDto } from './dto';

@Injectable()
export class SystemMailingService {
  private _appConfig: ApplicationConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly urlGeneratorService: UrlGeneratorService,
  ) {
    this._appConfig = this.configService.get<ApplicationConfig>('application');
  }

  @OnEvent(IamEventType.UserPasswordRecovery, { async: true })
  async sendPasswordRecoveryEmail(event: UserPasswordRecoveryEvent) {
    const domain = this.urlGeneratorService.createUrl();

    await this.mailerService.sendMail({
      to: event.userEmail,
      subject: `${this._appConfig.name} password recovery`,
      template: `./auth/password_recovery.html`,
      context: {
        appName: this._appConfig.name,
        appNameLower: this._appConfig.name.toLowerCase(),
        userName: event.userFullName,
        recoveryLink: `${domain}/recovery?token=${event.recoveryToken}`,
        supportEmail: this._appConfig.supportEmail,
        domain: domain,
      },
    });
  }

  async sendFeedback(account: Account | null, user: User | null, dto: SendFeedbackDto) {
    const accountName = account?.companyName ?? 'Unregistered';
    const userName = user?.fullName ?? null;
    const userEmail = user?.email ?? null;

    await this.mailerService.sendMail({
      to: this._appConfig.feedbackEmail,
      subject: `${this._appConfig.name} feedback (${dto.type}) from ${accountName}`,
      template: `./feedback/${dto.type}`.toLowerCase(),
      context: { ...dto.payload, accountId: account.id, accountName, userName, userEmail },
    });
  }
}
