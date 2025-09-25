import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { PagingQuery } from '@/common';

import { User } from '@/modules/iam/user/entities/user.entity';
import { EntityInfoService } from '@/modules/entity/entity-info/entity-info.service';

import { TelephonyCallCreatedEvent, TelephonyCallUpdatedEvent, TelephonyEventType } from '../../common';

import { VoximplantAccountService } from '../voximplant-account';
import { VoximplantScenarioService } from '../voximplant-scenario';
import { VoximplantUserService } from '../voximplant-user';
import { VoximplantNumberService } from '../voximplant-number';

import {
  CreateVoximplantCallDto,
  CreateVoximplantCallExtDto,
  UpdateVoximplantCallDto,
  UpdateVoximplantCallExtDto,
} from './dto';
import { VoximplantCall } from './entities';
import { VoximplantCallList } from './types';

interface FindFilter {
  id?: number;
  externalId?: string;
}

@Injectable()
export class VoximplantCallService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(VoximplantCall)
    private readonly repository: Repository<VoximplantCall>,
    private readonly entityInfoService: EntityInfoService,
    private readonly viAccountService: VoximplantAccountService,
    private readonly viUserService: VoximplantUserService,
    private readonly viScenarioService: VoximplantScenarioService,
    private readonly viNumberService: VoximplantNumberService,
  ) {}

  async create(accountId: number, userId: number, dto: CreateVoximplantCallDto): Promise<VoximplantCall> {
    const call = await this.repository.save(VoximplantCall.fromDto(accountId, userId, dto));

    this.eventEmitter.emit(
      TelephonyEventType.TelephonyCallCreated,
      new TelephonyCallCreatedEvent({
        accountId,
        entityId: call.entityId,
        callId: call.id,
        createdAt: call.createdAt.toISOString(),
      }),
    );

    return call;
  }

  async createExt(applicationId: number, dto: CreateVoximplantCallExtDto): Promise<VoximplantCall | null> {
    const viAccount = await this.viAccountService.findOneExt({ applicationId });
    if (viAccount) {
      const viUser = await this.viUserService.findOne(viAccount.accountId, { userName: dto.userName });
      if (viUser) {
        const viNumber = dto.viPhoneNumber
          ? await this.viNumberService.findOne(viAccount.accountId, { phoneNumber: dto.viPhoneNumber })
          : null;
        dto.numberId = viNumber?.id ?? dto.numberId ?? null;
        return this.create(viAccount.accountId, viUser.userId, dto);
      }
    }
    return null;
  }

  async findOne(accountId: number, filter?: FindFilter): Promise<VoximplantCall | null> {
    return this.createFindQb(accountId, filter).getOne();
  }

  async findOneFull(accountId: number, user: User, filter?: FindFilter): Promise<VoximplantCall | null> {
    const call = await this.findOne(accountId, filter);
    if (call?.entityId) {
      call.entityInfo = await this.entityInfoService.findOne({ accountId, user, entityId: call.entityId });
    }
    return call;
  }

  async getList(accountId: number, user: User, paging?: PagingQuery): Promise<VoximplantCallList> {
    const [calls, total] = await this.createFindQb(accountId)
      .orderBy('created_at', 'DESC')
      .limit(paging?.take)
      .offset(paging?.skip)
      .getManyAndCount();
    for (const call of calls) {
      call.entityInfo = call.entityId
        ? await this.entityInfoService.findOne({ accountId, user, entityId: call.entityId })
        : null;
    }
    return new VoximplantCallList(calls, paging?.take + paging?.skip, total);
  }

  async updateByExternalId(
    accountId: number,
    userId: number,
    externalId: string,
    dto: UpdateVoximplantCallDto,
  ): Promise<VoximplantCall | null> {
    const viCall = await this.findOne(accountId, { externalId });
    return viCall ? this.updateCall(accountId, viCall, dto, userId) : null;
  }

  async updateExt(
    applicationId: number,
    externalId: string,
    dto: UpdateVoximplantCallExtDto,
  ): Promise<VoximplantCall | null> {
    const viAccount = await this.viAccountService.findOneExt({ applicationId });

    if (viAccount) {
      const viCall = await this.findOne(viAccount.accountId, { externalId });
      if (viCall) {
        const userId = dto.userName
          ? (await this.viUserService.findOne(viAccount.accountId, { userName: dto.userName }))?.userId
          : undefined;
        return this.updateCall(viAccount.accountId, viCall, dto, userId);
      }
    }
    return null;
  }

  private async updateCall(
    accountId: number,
    viCall: VoximplantCall,
    dto: UpdateVoximplantCallDto,
    userId: number | null | undefined,
  ): Promise<VoximplantCall> {
    const { status, entityId } = viCall;
    await this.repository.save(viCall.update(userId, dto));

    const call = await this.findOne(viCall.accountId, { id: viCall.id });

    if (status !== call.status) {
      const result = await this.viScenarioService.processCall(accountId, call);
      if (result?.entities?.length > 0) {
        call.entityId = result.entities[0].id;
        await this.repository.save(call);
      }
    }

    this.eventEmitter.emit(
      TelephonyEventType.TelephonyCallUpdated,
      new TelephonyCallUpdatedEvent({
        accountId,
        entityId: call.entityId,
        callId: call.id,
        createdAt: call.createdAt.toISOString(),
        oldEntityId: entityId,
      }),
    );

    return call;
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId });
    if (filter?.id) {
      qb.andWhere('id = :id', { id: filter.id });
    }
    if (filter?.externalId) {
      qb.andWhere(
        new Brackets((qb) =>
          qb
            .where('call_id = :callId', { callId: filter.externalId })
            .orWhere('session_id = :sessionId', { sessionId: filter.externalId }),
        ),
      );
    }
    return qb;
  }
}
