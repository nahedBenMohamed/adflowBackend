import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { ApplicationConfig } from '@/config';

import { FormatUrlOptions, formatUrlPath, formatUrlQuery } from '../../utils';

type CreateUrlParams = { route?: string; subdomain?: string } & FormatUrlOptions;

@Injectable()
export class UrlGeneratorService {
  private _appConfig: ApplicationConfig;

  constructor(private readonly configService: ConfigService) {
    this._appConfig = this.configService.get<ApplicationConfig>('application');
  }

  private baseUrl(subdomain?: string) {
    return subdomain ? `${this._appConfig.baseUrlTemplate.replace('{subdomain}', subdomain)}` : this._appConfig.baseUrl;
  }

  createUrl(params?: CreateUrlParams): string {
    if (!params) {
      return this.baseUrl();
    }

    let formattedRoute = params.path ? formatUrlPath(params.route, params.path) : params.route;
    if (formattedRoute.length && !formattedRoute.startsWith('/')) {
      formattedRoute = '/' + formattedRoute;
    }

    return formatUrlQuery(`${this.baseUrl(params.subdomain)}${formattedRoute}`, params.query);
  }
}
