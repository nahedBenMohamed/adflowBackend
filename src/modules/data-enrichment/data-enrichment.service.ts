import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import { CacheService, DateUtil, withTimeout } from '@/common';

import { DataEnrichmentConfig } from './config/data-enrichment.config';
import { getRuCountryNameByIsoCode, getUtcOffsetByRuCountryName } from './helpers';
import {
  BankRequisites,
  DadataBankRequisites,
  DadataOrgRequisites,
  DadataSuggestions,
  PhoneUserInfo,
  PhoneUserInfoFincalculator,
  PhoneUserInfoGeohelper,
  PhoneUserInfoSpNova,
  UserInfoContentSpNova,
} from './types';
import { OrganizationRequisites } from './types/organization-requisites';

const PhoneServiceUrls = {
  geohelper: 'https://geohelper.info/api/v1/phone-data',
  fincalculator: 'https://fincalculator.ru/api/tel',
  spNova: 'https://sp1-nova.ru/api/phones-data/',
} as const;

const DadataUrls = {
  bankRequisites: 'http://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank',
  orgRequisites: 'http://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party',
} as const;

@Injectable()
export class DataEnrichmentService {
  private _config: DataEnrichmentConfig;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cache: CacheService,
  ) {
    this._config = this.configService.get<DataEnrichmentConfig>('data-enrichment');
  }

  async getBankRequisites(query: string): Promise<BankRequisites[] | null> {
    const getData = async (query: string): Promise<DadataSuggestions<DadataBankRequisites> | null> => {
      try {
        const response = await lastValueFrom(
          this.httpService.get<DadataSuggestions<DadataBankRequisites>>(DadataUrls.bankRequisites, {
            params: { query },
            headers: { Authorization: `Token ${this._config.dadataApiKey}` },
          }),
        );
        return response.data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return null;
      }
    };

    const data = await this.cache.wrap(`DataEnrichment.bankRequisites:${query}`, () => getData(query), 604800);

    return data?.suggestions?.map((suggestion) => BankRequisites.fromDadata(suggestion));
  }

  async getOrgRequisites(query: string): Promise<OrganizationRequisites[] | null> {
    const getData = async (query: string): Promise<DadataSuggestions<DadataOrgRequisites> | null> => {
      try {
        const response = await lastValueFrom(
          this.httpService.get<DadataSuggestions<DadataOrgRequisites>>(DadataUrls.orgRequisites, {
            params: { query },
            headers: { Authorization: `Token ${this._config.dadataApiKey}` },
          }),
        );
        return response.data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return null;
      }
    };

    const data = await this.cache.wrap(`DataEnrichment.orgRequisites:${query}`, () => getData(query), 604800);

    return data?.suggestions?.map((suggestion) => OrganizationRequisites.fromDadata(suggestion));
  }

  async getPhoneInfo(phone: string): Promise<PhoneUserInfo> {
    const getData = async (phone: string): Promise<PhoneUserInfo> => {
      const timeout = 7500;

      const infos = await Promise.all([
        withTimeout(this.getPhoneInfoFincalculator(phone), timeout),
        withTimeout(this.getPhoneInfoSpNova(phone), timeout),
        withTimeout(this.getPhoneInfoGeohelper(phone), timeout),
      ]);

      const country = infos.find((info) => info?.country)?.country ?? null;
      const city = infos.find((info) => info?.city)?.city ?? null;
      const region = infos.find((info) => info?.region)?.region ?? null;
      const utcOffset = infos.find((info) => info?.utcOffset)?.utcOffset ?? getUtcOffsetByRuCountryName(country);

      return new PhoneUserInfo({ country, city, region, utcOffset });
    };

    const data = await this.cache.wrap(`DataEnrichment.phone:${phone}`, () => getData(phone), 604800);

    return new PhoneUserInfo(data);
  }

  // https://geohelper.info/ru/doc/api/#get/api/v1/phone-data
  private async getPhoneInfoGeohelper(phone: string): Promise<PhoneUserInfo> {
    try {
      const response$ = this.httpService.get(PhoneServiceUrls.geohelper, {
        params: {
          'locale[lang]': 'ru',
          'filter[phone]': phone,
          'locale[fallbackLang]': 'ru',
          apiKey: this._config.geohelperApiKey,
        },
      });

      const response = await lastValueFrom(response$);
      // we can't trust that service will return something
      const data = response.data as PhoneUserInfoGeohelper | null | undefined;

      // request failed
      if (!data?.success) {
        return null;
      }

      const composeRegion = (data: PhoneUserInfoGeohelper) => {
        const regionName = data?.result?.region?.name;
        const regionLocalizedName = data?.result?.region?.localityType?.localizedNames?.ru;
        const regionLocalizedNameShort = data?.result?.region?.localityType?.localizedNamesShort?.ru;

        if (regionName && (regionLocalizedName || regionLocalizedNameShort)) {
          return `${regionName} (${regionLocalizedName ?? regionLocalizedNameShort})`;
        }

        return null;
      };

      const timezoneOffset = data?.result?.region?.timezoneOffset;
      return new PhoneUserInfo({
        city: null,
        region: composeRegion(data),
        country: getRuCountryNameByIsoCode(data?.result?.region?.countryIso),
        utcOffset: timezoneOffset ? timezoneOffset / 3600 : null,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null;
    }
  }
  // https://fincalculator.ru/telefon/region-po-nomeru
  private async getPhoneInfoFincalculator(phone: string): Promise<PhoneUserInfo> {
    try {
      const response$ = this.httpService.get(`${PhoneServiceUrls.fincalculator}/${phone}`);

      const response = await lastValueFrom(response$);
      // we can't trust that service will return something
      const data = response.data as PhoneUserInfoFincalculator | null | undefined;

      // sometimes fincalculator returns wrong information about region (seems like it is a phone operator),
      // so we need to check that region is not hallucination, known hallucinations are presented below
      const knownRegionHallucinations = ['Кселл', 'ТОО'];

      const region = data?.region;

      return new PhoneUserInfo({
        city: null,
        region: region && !knownRegionHallucinations.includes(region) ? region : null,
        country: data?.country ?? null,
        utcOffset: data?.timeZone ?? null,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null;
    }
  }
  private async getPhoneInfoSpNova(phone: string): Promise<PhoneUserInfo> {
    try {
      const response$ = this.httpService.post(PhoneServiceUrls.spNova, [phone], {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await lastValueFrom(response$);
      // we can't trust that service will return something
      const data = response.data as PhoneUserInfoSpNova | null | undefined;
      const content = data?.[phone] as UserInfoContentSpNova | null | undefined;

      return new PhoneUserInfo({
        city: content?.city ?? null,
        region: content?.region ?? null,
        country: content?.country ?? null,
        utcOffset: content?.timezone ? DateUtil.extractOffsetFromUTCString(content.timezone) : null,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null;
    }
  }
}
