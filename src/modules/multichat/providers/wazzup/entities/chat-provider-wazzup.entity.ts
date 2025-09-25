import { Column, Entity, PrimaryColumn } from 'typeorm';

import { ChatProvider } from '../../../chat-provider/entities';

import { WazzupTransport } from '../enums';
import { WazzupProviderDto, CreateWazzupProviderDto } from '../dto';

@Entity()
export class ChatProviderWazzup {
  @PrimaryColumn()
  providerId: number;

  @Column()
  apiKey: string;

  @Column()
  channelId: string;

  @Column()
  transport: WazzupTransport;

  @Column()
  plainId: string;

  @Column()
  accountId: number;

  _provider: ChatProvider;

  constructor(
    accountId: number,
    providerId: number,
    apiKey: string,
    channelId: string,
    transport: WazzupTransport,
    plainId: string,
  ) {
    this.accountId = accountId;
    this.providerId = providerId;
    this.apiKey = apiKey;
    this.channelId = channelId;
    this.transport = transport;
    this.plainId = plainId;
  }

  public get provider(): ChatProvider {
    return this._provider;
  }
  public set provider(provider: ChatProvider) {
    this._provider = provider;
  }

  public toDto(): WazzupProviderDto {
    return { ...this.provider.toDto(), channelId: this.channelId, plainId: this.plainId };
  }

  public static fromDto(accountId: number, providerId: number, dto: CreateWazzupProviderDto): ChatProviderWazzup {
    return new ChatProviderWazzup(accountId, providerId, dto.apiKey, dto.channelId, dto.channelTransport, dto.plainId);
  }
}
