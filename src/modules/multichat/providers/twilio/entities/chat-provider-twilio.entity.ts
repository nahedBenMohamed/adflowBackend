import { Column, Entity, PrimaryColumn } from 'typeorm';

import { ChatProvider } from '../../../chat-provider/entities';
import { TwilioProviderDto, CreateTwilioProviderDto, UpdateTwilioProviderDto } from '../dto';

@Entity()
export class ChatProviderTwilio {
  @PrimaryColumn()
  providerId: number;

  @Column()
  accountSid: string;

  @Column()
  authToken: string;

  @Column()
  phoneNumber: string;

  @Column()
  accountId: number;

  _provider: ChatProvider;

  constructor(accountId: number, providerId: number, accountSid: string, authToken: string, phoneNumber: string) {
    this.accountId = accountId;
    this.providerId = providerId;
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.phoneNumber = phoneNumber;
  }

  public get provider(): ChatProvider {
    return this._provider;
  }
  public set provider(provider: ChatProvider) {
    this._provider = provider;
  }

  public toDto(): TwilioProviderDto {
    return { ...this.provider.toDto(), accountSid: this.accountSid, phoneNumber: this.phoneNumber };
  }

  public static fromDto(accountId: number, providerId: number, dto: CreateTwilioProviderDto): ChatProviderTwilio {
    return new ChatProviderTwilio(accountId, providerId, dto.accountSid, dto.authToken, dto.phoneNumber);
  }

  public update(dto: UpdateTwilioProviderDto): ChatProviderTwilio {
    this.accountSid = dto.accountSid;
    this.phoneNumber = dto.phoneNumber;
    this.authToken = dto.authToken ? dto.authToken : this.authToken;
    return this;
  }
}
