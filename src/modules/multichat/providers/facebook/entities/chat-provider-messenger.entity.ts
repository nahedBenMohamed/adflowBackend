import { Column, Entity, PrimaryColumn } from 'typeorm';

import { ChatProvider } from '../../../chat-provider/entities';
import { MessengerProviderDto, CreateMessengerProviderDto } from '../dto';

@Entity()
export class ChatProviderMessenger {
  @PrimaryColumn()
  providerId: number;

  @Column()
  userId: string;

  @Column()
  userAccessToken: string;

  @Column()
  pageId: string;

  @Column()
  pageAccessToken: string;

  @Column()
  accountId: number;

  _provider: ChatProvider;

  constructor(
    accountId: number,
    providerId: number,
    userId: string,
    userAccessToken: string,
    pageId: string,
    pageAccessToken: string,
  ) {
    this.accountId = accountId;
    this.providerId = providerId;
    this.userId = userId;
    this.userAccessToken = userAccessToken;
    this.pageId = pageId;
    this.pageAccessToken = pageAccessToken;
  }

  public get provider(): ChatProvider {
    return this._provider;
  }
  public set provider(provider: ChatProvider) {
    this._provider = provider;
  }

  public toDto(): MessengerProviderDto {
    return { ...this.provider.toDto(), pageId: this.pageId, pageAccessToken: this.pageAccessToken };
  }

  public static fromDto(accountId: number, providerId: number, dto: CreateMessengerProviderDto): ChatProviderMessenger {
    return new ChatProviderMessenger(
      accountId,
      providerId,
      dto.userId,
      dto.userAccessToken,
      dto.pageId,
      dto.pageAccessToken,
    );
  }
}
