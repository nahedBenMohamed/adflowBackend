import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { catchError, lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { DateUtil, FrontendRoute, UrlGeneratorService } from '@/common';
import { AccountService } from '@/modules/iam/account/account.service';
import { AccountSubscriptionService } from '@/modules/iam/account-subscription';

import { AppsumoConfig } from './config';
import { AppsumoLicense, AppsumoTier } from './entities';
import { AppsumoLicenseResponse, AppsumoTokenResponse, AppsumoWebhookRequest, AppsumoWebhookResponse } from './types';
import { AppsumoEventType } from './enums';

const AppsumoUrls = {
  base: 'https://appsumo.com',
  oauth: () => AppsumoUrls.base + '/openid',
  token: () => AppsumoUrls.oauth() + '/token',
  licenseKey: () => AppsumoUrls.oauth() + '/license_key',
} as const;

const RedirectPath = '/api/integration/appsumo/redirect';

interface Subscription {
  termInDays?: number;
  userLimit?: number;
  planName?: string;
  isTrial?: boolean;
}

@Injectable()
export class AppsumoService {
  private readonly logger = new Logger(AppsumoService.name);
  private readonly _config: AppsumoConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(AppsumoLicense)
    private readonly licenseRepository: Repository<AppsumoLicense>,
    @InjectRepository(AppsumoTier)
    private readonly tierRepository: Repository<AppsumoTier>,
    private readonly urlGenerator: UrlGeneratorService,
    private readonly accountService: AccountService,
    private readonly subscriptionService: AccountSubscriptionService,
  ) {
    this._config = this.configService.get<AppsumoConfig>('appsumo');
  }

  public async redirect(code: string | null | undefined): Promise<string> {
    if (code) {
      const tokenData = await this.getToken(code);
      if (tokenData?.access_token) {
        const licenseData = await this.getLicense(tokenData.access_token);
        if (licenseData?.license_key) {
          const license = await this.licenseRepository.findOneBy({ licenseKey: licenseData.license_key });
          if (license?.accountId) {
            const account = await this.accountService.findOne({ accountId: license.accountId });
            const tier = await this.tierRepository.findOneBy({ tier: license.tier });
            await this.subscriptionService.update({ accountId: account.id }, null, {
              isTrial: false,
              periodEnd: DateUtil.add(DateUtil.now(), { days: tier.termInDays }).toISOString(),
              userLimit: tier.userLimit,
              planName: tier.planName,
            });

            return this.urlGenerator.createUrl({ subdomain: account.subdomain });
          } else {
            return this.urlGenerator.createUrl({
              route: FrontendRoute.signup,
              query: { appsumo: licenseData.license_key },
            });
          }
        }
      }
    }

    return this.urlGenerator.createUrl();
  }

  public async webhook(dto: AppsumoWebhookRequest): Promise<AppsumoWebhookResponse> {
    if (!dto.test) {
      const prevLicense = dto.prev_license_key
        ? await this.licenseRepository.findOneBy({ licenseKey: dto.prev_license_key })
        : null;
      const prevAccountId = prevLicense?.accountId ?? null;
      if (prevLicense?.accountId) {
        await this.licenseRepository.save(prevLicense.update({ accountId: null }));
      }
      let license = await this.licenseRepository.findOneBy({ licenseKey: dto.license_key });
      if (license) {
        await this.licenseRepository.save(
          license.update({
            licenseKey: dto.license_key,
            licenseStatus: dto.license_status,
            planId: dto.plan_id,
            tier: dto.tier,
          }),
        );
      } else {
        license = await this.licenseRepository.save(
          new AppsumoLicense(
            dto.license_key,
            dto.prev_license_key,
            dto.license_status,
            dto.plan_id,
            dto.tier,
            prevAccountId,
          ),
        );
      }

      if (license.accountId) {
        const tier = await this.tierRepository.findOneBy({ tier: license.tier });
        const periodEnd =
          dto.event === AppsumoEventType.Deactivate
            ? DateUtil.now()
            : DateUtil.add(DateUtil.now(), { days: tier.termInDays });
        await this.subscriptionService.update({ accountId: license.accountId }, null, {
          isTrial: false,
          periodEnd: periodEnd.toISOString(),
          userLimit: tier.userLimit,
          planName: tier.planName,
        });
      }
    }

    return {
      success: true,
      event: dto.event,
    };
  }

  public async findSubscription(licenseKey: string): Promise<Subscription | null> {
    const license = await this.licenseRepository.findOneBy({ licenseKey });
    if (license) {
      const tier = await this.tierRepository.findOneBy({ tier: license.tier });
      if (tier) {
        return {
          termInDays: tier.termInDays,
          userLimit: tier.userLimit,
          planName: tier.planName,
          isTrial: false,
        };
      }
    }

    return null;
  }

  public async update(licenseKey: string, dto: Partial<AppsumoLicense>): Promise<AppsumoLicense> {
    const license = await this.licenseRepository.findOneBy({ licenseKey });
    if (license) {
      return await this.licenseRepository.save(license.update(dto));
    }

    return null;
  }

  private async getToken(code: string): Promise<AppsumoTokenResponse | null> {
    const { data } = await lastValueFrom<AxiosResponse<AppsumoTokenResponse>>(
      this.httpService
        .post(AppsumoUrls.token(), {
          client_id: this._config.clientId,
          client_secret: this._config.clientSecret,
          code: code,
          redirect_uri: this.urlGenerator.createUrl({ route: RedirectPath }),
          grant_type: 'authorization_code',
        })
        .pipe(
          catchError((error) => {
            this.logger.error(`AppSumo get token error`, (error as Error)?.stack);
            throw error;
          }),
        ),
    );

    return data;
  }

  private async getLicense(accessToken: string): Promise<AppsumoLicenseResponse | null> {
    const { data } = await lastValueFrom<AxiosResponse<AppsumoLicenseResponse>>(
      this.httpService.get(AppsumoUrls.licenseKey(), { params: { access_token: accessToken } }).pipe(
        catchError((error) => {
          this.logger.error(`AppSumo get license error`, (error as Error)?.stack);
          throw error;
        }),
      ),
    );

    return data;
  }
}
