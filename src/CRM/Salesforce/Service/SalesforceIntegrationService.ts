import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { lastValueFrom } from 'rxjs';
import * as qs from 'qs';

import { UrlGeneratorService, FrontendRoute, NotFoundError, formatUrlQuery } from '@/common';

import { UIDataRecord } from '../../Model/ExternalEntity/UIDataRecord';

import { SalesforceUIFields } from '../Util/SalesforceUIFields';
import { SalesforceCodeToType } from '../Util/SalesforceCodeToType';
import { SalesforceSettings } from '../Model/Settings/SalesforceSettings';
import { IntegrationData } from '../Model/IntegrationData';

const CALLBACK_PATH = '/api/integration/salesforce/auth/callback';
const SaleForceUrls = {
  services(domain: string) {
    return `https://${domain}.my.salesforce.com/services`;
  },
  auth(domain: string) {
    return `${this.services(domain)}/oauth2`;
  },
  token(domain: string) {
    return `${this.auth(domain)}/token`;
  },
  authorize(domain: string) {
    return `${this.auth(domain)}/authorize`;
  },
  sobjects(domain: string, type: string, id: string) {
    return `${this.services(domain)}/data/v56.0/sobjects/${type}/${id}`;
  },
} as const;

interface SalesforceObject {
  type: string;
  id: string;
}
interface ConnectionSettings extends SalesforceSettings {
  accessToken: string;
}

@Injectable()
export class SalesforceIntegrationService {
  private readonly logger = new Logger(SalesforceIntegrationService.name);
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(SalesforceSettings)
    private readonly repository: Repository<SalesforceSettings>,
    private readonly urlGenerator: UrlGeneratorService,
  ) {}

  public async getAuthorizeUrl(subdomain: string, id: string) {
    const settings = await this.repository.findOneBy({ id });
    if (!settings) {
      throw NotFoundError.withId(SalesforceSettings, id);
    }

    return formatUrlQuery(SaleForceUrls.authorize(settings.domain), {
      client_id: settings.key,
      redirect_uri: this.getCallbackUrl(subdomain),
      state: settings.id,
      response_type: 'code',
    });
  }

  public async disconnect(accountId: number, id: string) {
    await this.repository.update({ accountId, id }, { refreshToken: null });
  }

  public async processAuthCode(subdomain: string, code: string, state: string): Promise<string> {
    if (!state) {
      return this.getAuthRedirectUrl(subdomain, false, `SalesForce authentication callback state doesn't set`);
    }
    const settings = await this.repository.findOneBy({ id: state });
    if (!settings) {
      return this.getAuthRedirectUrl(subdomain, false, `SalesForce settings with id=${state} don't founded`);
    }

    const response = await this.callWithCatch(async () => {
      const { data } = await lastValueFrom(
        this.httpService.post(
          SaleForceUrls.token(settings.domain),
          qs.stringify({
            grant_type: 'authorization_code',
            code: code,
            client_id: settings.key,
            client_secret: settings.secret,
            redirect_uri: this.getCallbackUrl(subdomain),
          }),
        ),
      );
      return data;
    });

    if (response?.refresh_token) {
      await this.repository.update(settings.id, { refreshToken: response.refresh_token });
      return this.getAuthRedirectUrl(subdomain, true);
    }

    return this.getAuthRedirectUrl(subdomain, false, `Can't get Salesforce refresh token`);
  }

  private getAuthRedirectUrl(subdomain: string, result: boolean, message?: string): string {
    return this.urlGenerator.createUrl({
      route: FrontendRoute.settings.salesforce(),
      subdomain,
      query: { result: String(result), message },
    });
  }

  public async getDataFromUrl(accountId: number, url: string, entityUrl?: string): Promise<IntegrationData | null> {
    const settings = await this.getConnectionSettings(accountId);
    const urlParam = this.parseUrl(url);
    if (urlParam && settings) {
      const objectData = await this.getDataForObject(settings, urlParam.type, urlParam.id);
      const valuableData = Object.fromEntries(Object.entries(objectData).filter(([, value]) => value !== null));
      const uiData = Object.entries(valuableData)
        .filter(([key]) => SalesforceUIFields.get(urlParam.type).includes(key))
        .map(
          ([key, value]) =>
            new UIDataRecord(
              key,
              key.replace(/([A-Z])/g, ' $1'),
              value,
              SalesforceUIFields.get(urlParam.type).findIndex((field) => key === field),
            ),
        );
      uiData.push(new UIDataRecord('SalesforceType', 'Salesforce Type', urlParam.type, -1));
      const ownerId = uiData.find((item) => item.key === 'OwnerId');
      const ownerData = ownerId ? await this.getDataForObject(settings, 'user', ownerId.value) : null;
      if (ownerData) {
        uiData.push(new UIDataRecord('OwnerName', 'Owner Name', ownerData['Name'], ownerId.sortOrder));
        const ownerIdIdx = uiData.findIndex((item) => item.key === 'OwnerId');
        uiData.splice(ownerIdIdx, 1);
      }
      if (entityUrl) {
        await this.setDataForObject(settings, urlParam.type, urlParam.id, { AmworkEntityUrl__c: entityUrl });
      }
      return new IntegrationData(valuableData, uiData);
    }
    return null;
  }

  private getCallbackUrl(subdomain: string) {
    return this.urlGenerator.createUrl({ route: CALLBACK_PATH, subdomain });
  }

  private parseUrl(originalUrl: string): SalesforceObject | null {
    const { pathname } = new URL(originalUrl);
    const match = pathname.match(/\/lightning\/r\/([^/]*)\/([a-zA-Z0-9]{15,18})\/view/);
    if (match) {
      return { type: match[1], id: match[2] };
    } else {
      const match = pathname.match(/\/([a-zA-Z0-9]{15,18})$/);
      if (match) {
        const type = this.findObjectType(match[1].substring(0, 3));
        return { type, id: match[1] };
      }
    }
    return null;
  }

  private findObjectType(typeCode: string): string {
    return SalesforceCodeToType.get(typeCode);
  }

  private getDataForObject(settings: ConnectionSettings, type: string, id: string): Promise<object> {
    return this.callWithCatch(async () => {
      const { data } = await lastValueFrom(
        this.httpService.get(SaleForceUrls.sobjects(settings.domain, type, id), {
          headers: { Authorization: `Bearer ${settings.accessToken}` },
        }),
      );
      return data;
    });
  }

  private setDataForObject(settings: ConnectionSettings, type: string, id: string, data: object) {
    this.callWithCatch(async () => {
      await lastValueFrom(
        this.httpService.patch(SaleForceUrls.sobjects(settings.domain, type, id), data, {
          headers: { Authorization: `Bearer ${settings.accessToken}` },
        }),
      );
    });
  }

  private async getConnectionSettings(accountId: number, domain?: string): Promise<ConnectionSettings> {
    const settingsList = await this.repository.find({ where: { accountId, domain, refreshToken: Not(IsNull()) } });
    for (const settings of settingsList) {
      const response = await this.callWithCatch(async () => {
        const { data } = await lastValueFrom(
          this.httpService.post(
            SaleForceUrls.token(settings.domain),
            qs.stringify({
              grant_type: 'refresh_token',
              refresh_token: settings.refreshToken,
              client_id: settings.key,
              client_secret: settings.secret,
            }),
          ),
        );
        return data;
      });
      if (response?.access_token) {
        return { ...settings, accessToken: response.access_token };
      }
    }
    return null;
  }

  private async callWithCatch(func: () => Promise<any>): Promise<any> {
    try {
      return await func();
    } catch (e) {
      this.logger.error(`Error in SalesforceIntegration`, (e as Error)?.stack);
      return {};
    }
  }
}
