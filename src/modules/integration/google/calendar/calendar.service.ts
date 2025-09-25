import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth, calendar_v3, google } from 'googleapis';
import { Brackets, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
  BadRequestError,
  DateUtil,
  formatState,
  FrontendRoute,
  NotFoundError,
  parseState,
  TokenService,
  UrlGeneratorService,
} from '@/common';
import { EntityInfoService } from '@/modules/entity/entity-info';
import { AccountService } from '@/modules/iam/account/account.service';
import { User } from '@/modules/iam/user/entities';

import { AuthService } from '../auth/auth.service';
import { CreateGoogleCalendarDto, GoogleCalendarLinkedDto, UpdateGoogleCalendarDto } from './dto';
import { CalendarType } from './enums';
import { GoogleCalendar, GoogleCalendarAccount, GoogleCalendarLinked } from './entities';
import { CalendarAccess, CalendarEvent, CalendarInfo, CalendarUpsertEvent, EventExtendedProperties } from './types';
import { CalendarEmitter } from './calendar.emitter';
import { EventUtil } from './utils';

interface FindFilter {
  accountId: number;
  calendarId?: number;
  calendarAccountId?: number;
  createdBy?: number;
  externalId?: string;
  type?: CalendarType;
  objectId?: number;
  linkedObjectId?: number;
  processAll?: boolean;
  responsibleId?: number;
}

interface EventSearchParams {
  api: calendar_v3.Calendar;
  calendar: GoogleCalendar;
  extendedProperties: EventExtendedProperties;
  externalId?: string | null;
}
interface CalendarActionParams<E> {
  api: calendar_v3.Calendar;
  calendar: GoogleCalendar;
  event: E;
  current: calendar_v3.Schema$Event | null;
  extendedProperties: EventExtendedProperties;
}
type CalendarAction<E> = (params: CalendarActionParams<E>) => Promise<void>;
type ApiAction<R> = (params: { api: calendar_v3.Calendar; calendar: GoogleCalendar }) => Promise<R>;

const CallbackPath = '/api/integration/google/calendar/callback';
const WebhookPath = {
  calendars: '/api/integration/google/calendar/webhook-calendars',
  events: '/api/integration/google/calendar/webhook-events',
};

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  constructor(
    @InjectRepository(GoogleCalendarAccount)
    private readonly repositoryAccount: Repository<GoogleCalendarAccount>,
    @InjectRepository(GoogleCalendar)
    private readonly repositoryCalendar: Repository<GoogleCalendar>,
    @InjectRepository(GoogleCalendarLinked)
    private readonly repositoryLinked: Repository<GoogleCalendarLinked>,
    private readonly tokenService: TokenService,
    private readonly urlGenerator: UrlGeneratorService,
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
    private readonly entityInfoService: EntityInfoService,
    private readonly calendarEmitter: CalendarEmitter,
  ) {}

  public async getAuthorizeUrl({ accountId, userId }: { accountId: number; userId: number }): Promise<string> {
    return this.authService.generateAuthUrl({
      auth: { callbackPath: CallbackPath },
      scope: [
        'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      state: formatState(accountId, userId),
    });
  }

  public async getRedirectUrl({ state, code }: { state: string; code: string }): Promise<string | null> {
    const [accountIdStr] = parseState(state, String);
    if (accountIdStr) {
      const accountId = Number(accountIdStr);
      const account = await this.accountService.findOne({ accountId });
      if (account) {
        return this.urlGenerator.createUrl({
          route: FrontendRoute.settings.google.calendar(),
          subdomain: account.subdomain,
          query: { code },
        });
      }
    }
    return null;
  }

  public async processAuthCode({ code }: { code: string; state?: string }): Promise<CalendarAccess> {
    const tokens = await this.authService.getToken({
      auth: { callbackPath: CallbackPath },
      code,
    });

    const calendars = await this.getCalendarList(tokens);
    const calendarInfos = calendars.filter((c) => !c.deleted && !c.hidden).map(CalendarInfo.fromApi);

    return new CalendarAccess({ calendarInfos, token: this.tokenService.create(tokens) });
  }

  public async create({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: CreateGoogleCalendarDto;
  }): Promise<GoogleCalendar> {
    const tokens = this.tokenService.verify<Auth.Credentials>(dto.token);

    const calendarAccount = await this.getCalendarAccount({ accountId, tokens });
    const calendar = await this.repositoryCalendar.save(
      GoogleCalendar.fromDto({ accountId, createdBy: userId, calendarAccountId: calendarAccount.id, dto }),
    );

    if (dto.linked) {
      calendar.linked = await this.processLinked({ accountId, calendarId: calendar.id, dtos: dto.linked });
    }

    return this.withApi({
      calendar,
      calendarAccount,
      action: async ({ api, calendar }) => {
        const from = dto.syncEvents ? DateUtil.startOf(DateUtil.now(), 'day') : undefined;
        calendar = await this.syncEvents({ api, calendar, from });
        return this.startWatchEvents({ api, calendar });
      },
    });
  }

  public async findOne(filter: FindFilter & { user?: User }): Promise<GoogleCalendar | null> {
    const createdBy = filter.user?.isAdmin ? undefined : filter.createdBy || filter.user?.id;

    return this.createFindQb({ ...filter, createdBy }).getOne();
  }
  public async findMany(filter: FindFilter & { user?: User }): Promise<GoogleCalendar[]> {
    const createdBy = filter.user?.isAdmin ? undefined : filter.createdBy || filter.user?.id;

    return this.createFindQb({ ...filter, createdBy })
      .orderBy('calendar.created_at', 'ASC')
      .getMany();
  }

  public async update({
    accountId,
    calendarId,
    dto,
  }: {
    accountId: number;
    userId: number;
    calendarId: number;
    dto: UpdateGoogleCalendarDto;
  }): Promise<GoogleCalendar> {
    const calendar = await this.findOne({ accountId, calendarId });
    if (!calendar) {
      throw NotFoundError.withId(GoogleCalendar, calendarId);
    }

    await this.repositoryCalendar.save(calendar.update(dto));

    if (dto.linked) {
      calendar.linked = await this.processLinked({
        accountId,
        calendarId: calendar.id,
        linked: calendar.linked,
        dtos: dto.linked,
      });
    }

    return calendar;
  }

  public async delete({ accountId, calendarId }: { accountId: number; calendarId: number }): Promise<number | null> {
    const calendar = await this.findOne({ accountId, calendarId });
    if (!calendar) {
      throw NotFoundError.withId(GoogleCalendar, calendarId);
    }

    await this.deleteCalendar({ accountId, calendar });

    return calendar.id;
  }

  private async deleteCalendar({
    accountId,
    calendar,
  }: {
    accountId: number;
    calendar: GoogleCalendar;
  }): Promise<number | null> {
    try {
      await this.withApi({ calendar, action: (param) => this.stopWatchEvents(param) });
    } catch (e) {
      this.logger.warn(`Failed to stop watch events: ${e}`);
    }
    await this.repositoryCalendar.delete({ accountId, id: calendar.id });

    await this.cleanCalendarAccount({ accountId, calendarAccountId: calendar.calendarAccountId });

    return calendar.id;
  }

  public async processWebhookCalendars({
    channelId,
    resourceId,
    resourceState,
  }: {
    channelId: string;
    resourceId: string;
    resourceState: string;
  }) {
    if (resourceState === 'exists') {
      const accounts = await this.repositoryAccount.find({ where: { channelId, channelResourceId: resourceId } });
      await Promise.all(
        accounts.map(async (calendarAccount) => {
          const api = await this.getApi(calendarAccount);
          if (api) {
            await this.syncCalendars({ api, calendarAccount, incremental: true });
          }
        }),
      );
    }
  }

  public async processWebhookEvents({
    channelId,
    resourceId,
    resourceState,
  }: {
    channelId: string;
    resourceId: string;
    resourceState: string;
  }) {
    if (resourceState === 'exists') {
      const calendars = await this.repositoryCalendar
        .createQueryBuilder('calendar')
        .leftJoinAndMapMany('calendar.linked', GoogleCalendarLinked, 'link', 'link.calendar_id = calendar.id')
        .where('calendar.channel_id = :channelId', { channelId })
        .andWhere('calendar.channel_resource_id = :resourceId', { resourceId })
        .getMany();

      await Promise.all(
        calendars.map((calendar) =>
          this.withApi({ calendar, action: (param) => this.syncEvents({ ...param, incremental: true }) }),
        ),
      );
    }
  }

  public async renewChannels(): Promise<number> {
    const accounts = await this.repositoryAccount
      .createQueryBuilder()
      .where('channel_expiration IS NOT NULL')
      .andWhere(`channel_expiration < now() + interval '1 hour'`)
      .getMany();

    await Promise.all(
      accounts.map(async (account) => {
        const api = await this.getApi(account);
        if (api) {
          await this.stopWatchCalendars({ api, calendarAccount: account });
          return this.startWatchCalendars({ api, calendarAccount: account });
        }
        return null;
      }),
    );

    const calendars = await this.repositoryCalendar
      .createQueryBuilder()
      .where('channel_expiration IS NOT NULL')
      .andWhere(`channel_expiration < now() + interval '1 hour'`)
      .getMany();

    await Promise.all(
      calendars.map(async (calendar) => {
        await this.withApi({
          calendar,
          action: async (param) => {
            await this.stopWatchEvents(param);
            return this.startWatchEvents(param);
          },
        });
      }),
    );

    return (accounts.length ?? 0) + (calendars.length ?? 0);
  }

  public async handleUpsert(event: CalendarUpsertEvent) {
    await this.processEvent({ event, action: (params) => this.upsertEvent(params) });
  }

  public async handleDeleted(event: CalendarEvent) {
    await this.processEvent({ event, action: (params) => this.deleteEvent(params) });
  }

  public async handleDeleteByObject({
    accountId,
    type,
    objectId,
  }: {
    accountId: number;
    type: CalendarType;
    objectId: number;
  }) {
    const calendars = await this.findMany({ accountId, type, objectId });
    await Promise.all(
      calendars.map(async (calendar) => {
        await this.deleteCalendar({ accountId, calendar });
      }),
    );
    await this.repositoryLinked.delete({ accountId, objectId, type });
  }

  public async handleDeleteByResponsible({
    accountId,
    type,
    responsibleId,
    newResponsibleId,
  }: {
    accountId: number;
    type: CalendarType;
    responsibleId: number;
    newResponsibleId?: number | null;
  }) {
    if (newResponsibleId) {
      await this.repositoryCalendar.update({ accountId, type, responsibleId }, { responsibleId: newResponsibleId });
    } else {
      const calendars = await this.findMany({ accountId, type, responsibleId });
      await Promise.all(calendars.map((calendar) => this.deleteCalendar({ accountId, calendar })));
    }
  }

  private async processEvent<E extends CalendarEvent>({ event, action }: { event: E; action: CalendarAction<E> }) {
    const calendars = await this.findMany({
      accountId: event.accountId,
      type: event.type,
      responsibleId: event.ownerId,
      objectId: event.objectId,
      linkedObjectId: event.objectId,
      processAll: true,
    });

    await Promise.all(
      calendars
        .filter((calendar) => !calendar.readonly)
        .map(async (calendar) => {
          const extendedProperties = EventUtil.getExtendedProperties(event);

          await this.withApi({
            calendar,
            action: async ({ api, calendar }) => {
              const current = await this.findTaskEvent({
                api,
                calendar,
                extendedProperties,
                externalId: event.externalId,
              });
              return action({ api, calendar, event, current, extendedProperties });
            },
          });
        }),
    );
  }

  private async upsertEvent({
    api,
    calendar,
    event,
    current,
    extendedProperties,
  }: CalendarActionParams<CalendarUpsertEvent>) {
    const requestBody = await this.createEventRequestBody({ event, extendedProperties });
    try {
      if (current) {
        api.events.update({ calendarId: calendar.externalId, eventId: current.id, requestBody });
      } else {
        api.events.insert({ calendarId: calendar.externalId, requestBody });
      }
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Google Calendar upsert event error: ${error?.message}`, error?.stack);
    }
  }

  private async createEventRequestBody({
    event,
    extendedProperties,
  }: {
    event: CalendarUpsertEvent;
    extendedProperties: EventExtendedProperties;
  }): Promise<calendar_v3.Schema$Event> {
    const source = await this.getSource({ accountId: event.accountId, entityId: event.entityId });
    return {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endDate.toISOString(),
        timeZone: 'UTC',
      },
      source,
      status: event.status,
      extendedProperties,
    };
  }

  private async getSource({
    accountId,
    entityId,
  }: {
    accountId: number | null | undefined;
    entityId: number | null | undefined;
  }): Promise<{ title: string; url: string } | undefined> {
    if (accountId && entityId) {
      const entityInfo = await this.entityInfoService.findOne({ accountId, entityId });
      const account = await this.accountService.findOne({ accountId });
      const url = this.urlGenerator.createUrl({
        route: FrontendRoute.entity.card({ entityTypeId: entityInfo.entityTypeId, entityId: entityInfo.id }),
        subdomain: account.subdomain,
      });
      return { title: entityInfo.name, url };
    }
    return undefined;
  }

  private async deleteEvent({ api, calendar, current }: CalendarActionParams<CalendarEvent>) {
    if (current) {
      try {
        api.events.delete({ calendarId: calendar.externalId, eventId: current.id });
      } catch (e) {
        const error = e as Error;
        this.logger.error(`Google Calendar delete event error: ${error?.message}`, error?.stack);
      }
    }
  }

  private async getCalendarList(tokens: Auth.Credentials): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    try {
      const { client } = await this.authService.getOAuth2Client({ tokens });
      const api = google.calendar({ version: 'v3', auth: client });

      const { data } = await api.calendarList.list();

      return data?.items ?? [];
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Google Calendar calendars list error: ${error?.message}`, error?.stack);
    }
    return [];
  }

  private async getCalendarAccount({
    accountId,
    tokens,
  }: {
    accountId: number;
    tokens: Auth.Credentials;
  }): Promise<GoogleCalendarAccount> {
    const calendars = await this.getCalendarList(tokens);
    const primary = calendars.find((c) => c.primary);
    if (!primary) {
      throw new BadRequestError('Primary calendar not found');
    }

    let calendarAccount = await this.repositoryAccount.findOne({ where: { accountId, externalId: primary.id } });
    if (calendarAccount) {
      await this.repositoryAccount.save(calendarAccount.updateTokens(tokens));

      return calendarAccount;
    }

    calendarAccount = await this.repositoryAccount.save(
      new GoogleCalendarAccount({ accountId, tokens, externalId: primary.id }),
    );

    const api = await this.getApi(calendarAccount);
    if (api) {
      calendarAccount = await this.syncCalendars({ api, calendarAccount });
      calendarAccount = await this.startWatchCalendars({ calendarAccount, api });
    }

    return calendarAccount;
  }

  private async cleanCalendarAccount({
    accountId,
    calendarAccountId,
  }: {
    accountId: number;
    calendarAccountId: number;
  }) {
    const calendars = await this.repositoryCalendar.find({ where: { accountId, calendarAccountId } });
    if (calendars.length === 0) {
      const calendarAccount = await this.repositoryAccount.findOne({ where: { accountId, id: calendarAccountId } });
      if (calendarAccount) {
        try {
          const api = await this.getApi(calendarAccount);
          if (api) {
            await this.stopWatchCalendars({ calendarAccount, api });
          }
        } catch (e) {
          this.logger.warn(`Failed to stop watch calendars: ${e}`);
        }

        await this.repositoryAccount.delete({ accountId, id: calendarAccountId });
      }
    }
  }

  private async getApi(calendarAccount: GoogleCalendarAccount): Promise<calendar_v3.Calendar | null> {
    try {
      const { client, refreshedTokens } = await this.authService.getOAuth2Client({
        tokens: calendarAccount.tokens,
      });
      if (refreshedTokens) {
        calendarAccount = calendarAccount.updateTokens(refreshedTokens);
        await this.repositoryAccount.save(calendarAccount);
      }
      return google.calendar({ version: 'v3', auth: client });
    } catch (error) {
      this.logger.error(`Get API error for calendar account ${calendarAccount.id}`, (error as Error)?.stack);
      return null;
    }
  }

  private async syncCalendars({
    api,
    calendarAccount,
    incremental = false,
  }: {
    api: calendar_v3.Calendar;
    calendarAccount: GoogleCalendarAccount;
    incremental?: boolean;
  }): Promise<GoogleCalendarAccount> {
    let pageToken: string | undefined = undefined;
    let syncToken: string | undefined = incremental ? calendarAccount.syncToken : undefined;
    const calendars: calendar_v3.Schema$CalendarListEntry[] = [];
    do {
      try {
        const { data } = await api.calendarList.list({
          showDeleted: !!syncToken,
          pageToken,
          syncToken,
        });
        pageToken = data.nextPageToken;
        syncToken = data.nextSyncToken ?? syncToken;
        calendars.push(...(data.items ?? []));
      } catch (error) {
        if (error['code'] === 410 && incremental) {
          return this.syncCalendars({ api, calendarAccount });
        } else {
          this.logger.error('Google Calendar calendars sync error', (error as Error)?.stack);
        }
      }
    } while (pageToken);

    await Promise.all(
      calendars
        .filter((calendar) => calendar.deleted)
        .map(async (calendar) => {
          const current = await this.findOne({
            accountId: calendarAccount.accountId,
            calendarAccountId: calendarAccount.id,
            externalId: calendar.id,
          });

          if (current) {
            await this.deleteCalendar({ accountId: current.accountId, calendar: current });
          }
        }),
    );

    await this.repositoryAccount.update(
      { accountId: calendarAccount.accountId, id: calendarAccount.id },
      { syncToken },
    );
    return calendarAccount.updateSyncToken(syncToken);
  }

  private async startWatchCalendars({
    calendarAccount,
    api,
  }: {
    calendarAccount: GoogleCalendarAccount;
    api: calendar_v3.Calendar;
  }): Promise<GoogleCalendarAccount> {
    const { data } = await api.calendarList.watch({
      requestBody: {
        id: uuidv4(),
        type: 'web_hook',
        address: this.urlGenerator.createUrl({ route: WebhookPath.calendars }),
      },
    });

    const channelExpiration: Date | undefined = data.expiration ? new Date(Number(data.expiration)) : undefined;
    await this.repositoryAccount.update(
      { accountId: calendarAccount.accountId, id: calendarAccount.id },
      { channelId: data.id, channelResourceId: data.resourceId, channelExpiration },
    );

    return calendarAccount.updateChannel({ channelId: data.id, channelResourceId: data.resourceId, channelExpiration });
  }

  private async stopWatchCalendars({
    calendarAccount,
    api,
  }: {
    calendarAccount: GoogleCalendarAccount;
    api: calendar_v3.Calendar;
  }): Promise<GoogleCalendarAccount> {
    if (calendarAccount.channelId && calendarAccount.channelResourceId) {
      try {
        await api.channels.stop({
          requestBody: { id: calendarAccount.channelId, resourceId: calendarAccount.channelResourceId },
        });
      } catch (e) {
        const error = e as Error;
        this.logger.error(`Google Calendar stop watch error: ${error?.message}`, error?.stack);
      }
    }

    await this.repositoryAccount.update(
      { accountId: calendarAccount.accountId, id: calendarAccount.id },
      { channelId: null, channelResourceId: null, channelExpiration: null },
    );

    return calendarAccount.updateChannel({ channelId: null, channelResourceId: null, channelExpiration: null });
  }

  private async withApi<R>({
    calendar,
    calendarAccount,
    action,
  }: {
    calendar: GoogleCalendar;
    calendarAccount?: GoogleCalendarAccount;
    action: ApiAction<R>;
  }): Promise<R> {
    if (!calendarAccount) {
      calendarAccount = await this.repositoryAccount.findOne({ where: { id: calendar.calendarAccountId } });
    }
    const api = await this.getApi(calendarAccount);
    if (!api) {
      throw new Error('Google Calendar API not found');
    }

    return action({ api, calendar });
  }

  private async syncEvents({
    api,
    calendar,
    incremental = false,
    from,
  }: {
    api: calendar_v3.Calendar;
    calendar: GoogleCalendar;
    incremental?: boolean;
    from?: Date;
  }): Promise<GoogleCalendar> {
    let pageToken: string | undefined = undefined;
    let syncToken: string | undefined = incremental ? calendar.syncToken : undefined;
    const events: calendar_v3.Schema$Event[] = [];
    do {
      try {
        const { data } = await api.events.list({
          calendarId: calendar.externalId,
          singleEvents: true,
          showDeleted: !!syncToken,
          updatedMin: !syncToken && !from ? DateUtil.now().toISOString() : undefined,
          timeMin: !syncToken && from ? from.toISOString() : undefined,
          pageToken,
          syncToken,
        });
        pageToken = data.nextPageToken;
        syncToken = data.nextSyncToken ?? syncToken;
        events.push(...(data.items ?? []));
      } catch (error) {
        if (error['code'] === 410 && incremental) {
          return this.syncEvents({ api, calendar });
        } else {
          this.logger.error('Google Calendar events sync error', (error as Error)?.stack);
        }
      }
    } while (pageToken);

    await Promise.all(events.map((event) => this.calendarEmitter.emit({ calendar, event })));

    await this.repositoryCalendar.update({ accountId: calendar.accountId, id: calendar.id }, { syncToken });
    return calendar.updateSyncToken(syncToken);
  }

  private async startWatchEvents({
    api,
    calendar,
  }: {
    api: calendar_v3.Calendar;
    calendar: GoogleCalendar;
  }): Promise<GoogleCalendar> {
    const { data } = await api.events.watch({
      calendarId: calendar.externalId,
      requestBody: {
        id: uuidv4(),
        type: 'web_hook',
        address: this.urlGenerator.createUrl({ route: WebhookPath.events }),
      },
    });

    const channelExpiration: Date | undefined = data.expiration ? new Date(Number(data.expiration)) : undefined;
    await this.repositoryCalendar.update(
      { accountId: calendar.accountId, id: calendar.id },
      { channelId: data.id, channelResourceId: data.resourceId, channelExpiration },
    );

    return calendar.updateChannel({ channelId: data.id, channelResourceId: data.resourceId, channelExpiration });
  }

  private async stopWatchEvents({
    api,
    calendar,
  }: {
    api: calendar_v3.Calendar;
    calendar: GoogleCalendar;
  }): Promise<GoogleCalendar> {
    if (calendar.channelId && calendar.channelResourceId) {
      try {
        await api.channels.stop({ requestBody: { id: calendar.channelId, resourceId: calendar.channelResourceId } });
      } catch (e) {
        const error = e as Error;
        this.logger.error(`Google Calendar stop watch events error: ${error?.message}`, error?.stack);
      }
    }

    await this.repositoryCalendar.update(
      { accountId: calendar.accountId, id: calendar.id },
      { channelId: null, channelResourceId: null, channelExpiration: null },
    );

    return calendar.updateChannel({ channelId: null, channelResourceId: null, channelExpiration: null });
  }

  private async findTaskEvent({
    api,
    calendar,
    extendedProperties,
    externalId,
  }: EventSearchParams): Promise<calendar_v3.Schema$Event | null> {
    try {
      if (externalId) {
        const { data } = await api.events.list({ calendarId: calendar.externalId, iCalUID: externalId });
        if (data.items?.[0]) {
          return data.items[0];
        }
      }

      const { data } = await api.events.list({
        calendarId: calendar.externalId,
        sharedExtendedProperty: Object.entries(extendedProperties.shared).map(([key, value]) => `${key}=${value}`),
      });

      return data?.items?.[0] ?? null;
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Google Calendar find task event error: ${error?.message}`, error?.stack);
    }
    return null;
  }

  private async processLinked({
    accountId,
    calendarId,
    linked = [],
    dtos,
  }: {
    accountId: number;
    calendarId: number;
    linked?: GoogleCalendarLinked[];
    dtos: GoogleCalendarLinkedDto[];
  }): Promise<GoogleCalendarLinked[]> {
    const toDelete = linked.filter((l) => !dtos.some((dto) => dto.type === l.type && dto.objectId === l.objectId));
    const toCreate = dtos.filter((dto) => !linked.find((l) => l.type === dto.type && l.objectId === dto.objectId));

    await Promise.all(toDelete.map((item) => this.repositoryLinked.delete({ accountId, id: item.id })));
    const created = await Promise.all(
      toCreate.map((dto) => this.repositoryLinked.save(GoogleCalendarLinked.fromDto({ accountId, calendarId, dto }))),
    );

    return [...linked.filter((l) => !toDelete.some((d) => d.id === l.id)), ...created];
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repositoryCalendar
      .createQueryBuilder('calendar')
      .where('calendar.account_id = :accountId', { accountId: filter.accountId })
      .leftJoinAndMapMany('calendar.linked', GoogleCalendarLinked, 'link', 'link.calendar_id = calendar.id');
    if (filter.calendarId) {
      qb.andWhere('calendar.id = :id', { id: filter.calendarId });
    }
    if (filter.calendarAccountId) {
      qb.andWhere('calendar.calendar_account_id = :calendarAccountId', { calendarAccountId: filter.calendarAccountId });
    }
    if (filter.createdBy) {
      qb.andWhere('calendar.created_by = :createdBy', { createdBy: filter.createdBy });
    }
    if (filter.externalId) {
      qb.andWhere('calendar.external_id = :externalId', { externalId: filter.externalId });
    }
    if (filter.responsibleId) {
      qb.andWhere('calendar.responsible_id = :responsibleId', { responsibleId: filter.responsibleId });
    }
    if (filter.type) {
      qb.andWhere('calendar.type = :type', { type: filter.type });
    }
    if (filter.objectId || filter.linkedObjectId || filter.processAll) {
      qb.andWhere(
        new Brackets((qb1) => {
          if (filter.objectId) {
            qb1.where('calendar.object_id = :objectId', { objectId: filter.objectId });
          }
          if (filter.linkedObjectId) {
            if (filter.type) {
              qb1.orWhere(
                new Brackets((qbS) =>
                  qbS
                    .where('link.type = :typeLinked', { typeLinked: filter.type })
                    .andWhere('link.object_id = :linkedObjectId', { linkedObjectId: filter.linkedObjectId }),
                ),
              );
            } else {
              qb1.orWhere('link.object_id = :linkedObjectId', { linkedObjectId: filter.linkedObjectId });
            }
          }
          if (filter.processAll) {
            qb1.orWhere('calendar.process_all = true');
          }
        }),
      );
    }

    return qb;
  }
}
