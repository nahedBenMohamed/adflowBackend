import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { OnEvent } from '@nestjs/event-emitter';
import { catchError, lastValueFrom } from 'rxjs';

import { IamEventType, AccountCreatedEvent, UserLoginEvent } from '@/modules//iam/common';

import { AnalyticsConfig } from './config/analytics.config';

const GoogleAnalyticsUrls = {
  ga: 'https://www.google-analytics.com',
  mp: () => `${GoogleAnalyticsUrls.ga}/mp`,
  collect: (measurementId: string, apiSecret: string) =>
    `${GoogleAnalyticsUrls.mp()}/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
} as const;

interface GaEventData {
  client_id: string;
  events: { name: string; params: GaEventDataParam }[];
}

type GaEventDataParam = Record<string, string | number | boolean>;

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private _config: AnalyticsConfig;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this._config = this.configService.get<AnalyticsConfig>('analytics');
  }

  @OnEvent(IamEventType.AccountCreated, { async: true })
  public async handleRegistrationEvent(event: AccountCreatedEvent) {
    this.collectGAEvents({
      client_id: event.gaClientId,
      events: [
        {
          name: 'sign_up',
          params: {
            account_id: event.accountId,
            account_user_id: event.ownerId,
            user_id: event.gaUserId,
            account_tariff: event.subscriptionName,
          },
        },
      ],
    });
  }

  @OnEvent(IamEventType.UserLogin, { async: true })
  public async handleUserLoginEvent(event: UserLoginEvent) {
    this.collectGAEvents({
      client_id: event.gaClientId,
      events: [
        {
          name: 'login',
          params: {
            account_id: event.accountId,
            account_user_id: event.userId,
            user_id: event.gaUserId,
            account_tariff: event.subscriptionName,
          },
        },
      ],
    });
  }

  private async collectGAEvents(data: GaEventData) {
    const url = GoogleAnalyticsUrls.collect(this._config.gaMeasurementId, this._config.gaApiSecret);
    const response$ = this.httpService.post(url, data).pipe(
      catchError((error) => {
        this.logger.error(`Google Analytics measurement error`, (error as Error)?.stack);
        throw error;
      }),
    );
    await lastValueFrom(response$);
  }
}
