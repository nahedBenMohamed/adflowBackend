import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, Auth } from 'googleapis';

import { DateUtil, UrlGeneratorService } from '@/common';

import { GoogleConfig } from '../google.config';

interface AuthParams {
  clientId?: string;
  clientSecret?: string;
  subdomain?: string;
  callbackPath?: string;
  tokens?: Auth.Credentials;
}

@Injectable()
export class AuthService {
  private readonly _config: GoogleConfig;
  constructor(
    private readonly configService: ConfigService,
    private readonly urlGenerator: UrlGeneratorService,
  ) {
    this._config = this.configService.get<GoogleConfig>('google');
  }

  public async getOAuth2Client({ clientId, clientSecret, subdomain, callbackPath, tokens }: AuthParams = {}): Promise<{
    client: Auth.OAuth2Client;
    refreshedTokens: Auth.Credentials | undefined;
  }> {
    const redirectUri = callbackPath ? this.urlGenerator.createUrl({ route: callbackPath, subdomain }) : undefined;

    const client = new google.auth.OAuth2(
      clientId ?? this._config.auth.clientId,
      clientSecret ?? this._config.auth.clientSecret,
      redirectUri,
    );

    let refreshedTokens: Auth.Credentials | undefined = undefined;
    if (tokens) {
      client.setCredentials(tokens);

      if (tokens.expiry_date < DateUtil.now().getTime()) {
        const { credentials } = await client.refreshAccessToken();
        refreshedTokens = credentials;
        client.setCredentials(refreshedTokens);
      }
    }

    return { client, refreshedTokens };
  }

  public async generateAuthUrl({
    auth,
    scope,
    state,
  }: { auth?: AuthParams; scope?: string | string[]; state?: string } = {}): Promise<string> {
    const { client } = await this.getOAuth2Client(auth);
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope,
      state,
    });
  }

  public async getToken({ auth, code }: { auth?: AuthParams; code: string }): Promise<Auth.Credentials> {
    const { client } = await this.getOAuth2Client(auth);
    const { tokens } = await client.getToken(code);

    return tokens;
  }
}
