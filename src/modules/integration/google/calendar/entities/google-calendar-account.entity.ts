import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Auth } from 'googleapis';

@Entity()
export class GoogleCalendarAccount {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  externalId: string;

  @Column({ type: 'jsonb' })
  tokens: Auth.Credentials;

  @Column({ nullable: true })
  syncToken: string | null;

  @Column({ nullable: true })
  channelId: string | null;

  @Column({ nullable: true })
  channelResourceId: string | null;

  @Column({ nullable: true })
  channelExpiration: Date | null;

  constructor(data?: Pick<GoogleCalendarAccount, 'accountId' | 'tokens' | 'externalId'> & { createdAt?: Date }) {
    this.accountId = data?.accountId;
    this.tokens = data?.tokens;
    this.externalId = data?.externalId;
  }

  updateTokens(tokens: Auth.Credentials): GoogleCalendarAccount {
    this.tokens = tokens;

    return this;
  }

  updateChannel(
    data: Pick<GoogleCalendarAccount, 'channelId' | 'channelResourceId' | 'channelExpiration'>,
  ): GoogleCalendarAccount {
    this.channelId = data.channelId;
    this.channelResourceId = data.channelResourceId;
    this.channelExpiration = data.channelExpiration;

    return this;
  }

  updateSyncToken(syncToken: string): GoogleCalendarAccount {
    this.syncToken = syncToken;

    return this;
  }
}
