import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { NotFoundError, ObjectUtil } from '@/common';

import { VoximplantError } from '../../common';
import { VoximplantAccountService } from '../../voximplant-account/voximplant-account.service';

import { CreateVoximplantSIPDto, UpdateVoximplantSIPDto } from '../dto';
import { VoximplantSip } from '../entities';
import { ExpandableField, VoximplantSIPRegistration } from '../types';
import { VoximplantSipUserService } from './voximplant-sip-user.service';

interface FindFilter {
  sipId?: number;
  externalId?: number;
  accessibleUserId?: number;
}

interface FindOptions {
  expand?: ExpandableField[];
}

@Injectable()
export class VoximplantSipService {
  private readonly logger = new Logger(VoximplantSipService.name);
  constructor(
    @InjectRepository(VoximplantSip)
    private readonly repository: Repository<VoximplantSip>,
    private readonly viAccountService: VoximplantAccountService,
    private readonly viSipUserService: VoximplantSipUserService,
  ) {}
  public async create(accountId: number, dto: CreateVoximplantSIPDto): Promise<VoximplantSip | null> {
    const viSIPRegistration = await this.createSIPRegistration(accountId, dto);

    if (viSIPRegistration) {
      const viSip = await this.repository.save(new VoximplantSip(accountId, viSIPRegistration, dto.type, dto.name));

      if (dto.userIds?.length) {
        await this.viSipUserService.create(accountId, viSip.id, dto.userIds);
      }

      return this.findOne(accountId, { sipId: viSip.id }, { expand: ['users', 'registration'] });
    }

    throw new VoximplantError({ message: 'Create SIP registration error' });
  }

  public async findOne(accountId: number, filter?: FindFilter, options?: FindOptions): Promise<VoximplantSip | null> {
    const viSip = await this.createFindQb(accountId, filter).getOne();

    return viSip && options?.expand ? await this.expandOne(viSip, options.expand) : viSip;
  }
  public async findMany(accountId: number, filter?: FindFilter, options?: FindOptions): Promise<VoximplantSip[]> {
    const viSips = await this.createFindQb(accountId, filter).orderBy('vis.id', 'ASC').getMany();

    return viSips && options?.expand ? await this.expandMany(viSips, options.expand) : viSips;
  }

  public async update(accountId: number, sipId: number, dto: UpdateVoximplantSIPDto): Promise<VoximplantSip | null> {
    const viSip = await this.findOne(accountId, { sipId }, { expand: ['users'] });
    if (!viSip) {
      throw NotFoundError.withId(VoximplantSip, sipId);
    }

    viSip.type = dto.type ?? viSip.type;
    viSip.name = dto.name ?? viSip.name;
    this.repository.save(viSip);

    if (dto.userIds) {
      await this.viSipUserService.update(accountId, viSip.id, viSip.users, dto.userIds);
    }

    await this.updateSIPRegistration(accountId, viSip.externalId, dto);

    return this.findOne(accountId, { sipId }, { expand: ['users', 'registration'] });
  }

  public async delete(accountId: number, sipId: number): Promise<void> {
    const viSip = await this.repository.findOne({ where: { accountId, id: sipId } });
    if (!viSip) {
      throw NotFoundError.withId(VoximplantSip, sipId);
    }

    if (await this.deleteSIPRegistration(accountId, viSip.externalId)) {
      await this.repository.delete({ accountId, id: sipId });
    }
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('vis').where('vis.account_id = :accountId', { accountId });

    if (filter?.sipId) {
      qb.andWhere('vis.id = :id', { id: filter.sipId });
    }
    if (filter?.externalId) {
      qb.andWhere('vis.external_id = :externalId', { externalId: filter.externalId });
    }
    if (filter?.accessibleUserId) {
      qb.leftJoin('voximplant_sip_user', 'visu', 'visu.sip_id = vis.id').andWhere(
        new Brackets((qb1) =>
          qb1
            .where('visu.user_id = :accessibleUserId', { accessibleUserId: filter.accessibleUserId })
            .orWhere('visu.user_id is NULL'),
        ),
      );
    }

    return qb;
  }

  private async expandOne(viSip: VoximplantSip, expand: ExpandableField[]): Promise<VoximplantSip> {
    if (expand.includes('users')) {
      viSip.users = await this.viSipUserService.findMany(viSip.accountId, { sipId: viSip.id });
    }
    if (expand.includes('registration')) {
      viSip.registration = await this.getSIPRegistration(viSip.accountId, viSip.externalId);
    }
    return viSip;
  }
  private async expandMany(viSips: VoximplantSip[], expand: ExpandableField[]): Promise<VoximplantSip[]> {
    return await Promise.all(viSips.map((viSip) => this.expandOne(viSip, expand)));
  }

  private async createSIPRegistration(accountId: number, dto: CreateVoximplantSIPDto): Promise<number | null> {
    const { client, appParam } = await this.viAccountService.getClient(accountId);

    const viResponse = await client.SIPRegistration.createSipRegistration(
      ObjectUtil.assign(appParam, { ...dto, userIds: undefined }),
    );

    if (!viResponse.result) {
      this.logger.error(`Create SIP registration error: ${JSON.stringify(viResponse)}`);
      return null;
    }

    return viResponse.sipRegistrationId;
  }

  private async getSIPRegistration(
    accountId: number,
    sipRegistrationId: number,
  ): Promise<VoximplantSIPRegistration | null> {
    const { client, appParam } = await this.viAccountService.getClient(accountId);

    const viResponse = await client.SIPRegistration.getSipRegistrations({
      ...appParam,
      sipRegistrationId,
      ruleId: [],
      ruleName: '',
      userId: [],
      userName: '',
    });
    if (!viResponse.result) {
      this.logger.error(`Get SIP registration error: ${JSON.stringify(viResponse)}`);
      return null;
    }

    return viResponse.result[0];
  }

  private async updateSIPRegistration(
    accountId: number,
    sipRegistrationId: number,
    dto: UpdateVoximplantSIPDto,
  ): Promise<number | null> {
    const { client, appParam } = await this.viAccountService.getClient(accountId);

    const viResponse = await client.SIPRegistration.updateSipRegistration(
      ObjectUtil.assign({ ...appParam, sipRegistrationId }, { ...dto, userIds: undefined }),
    );
    if (!viResponse.result) {
      this.logger.error(`Create SIP registration error: ${JSON.stringify(viResponse)}`);
      return null;
    }

    return sipRegistrationId;
  }

  private async deleteSIPRegistration(accountId: number, sipRegistrationId: number): Promise<number | null> {
    const { client, appParam } = await this.viAccountService.getClient(accountId);

    const viResponse = await client.SIPRegistration.deleteSipRegistration({ ...appParam, sipRegistrationId });
    if (!viResponse.result) {
      this.logger.error(`Create SIP registration error: ${JSON.stringify(viResponse)}`);
      return null;
    }

    return sipRegistrationId;
  }
}
