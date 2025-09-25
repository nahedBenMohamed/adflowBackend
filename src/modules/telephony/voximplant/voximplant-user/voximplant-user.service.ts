import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import VoximplantApiClient from '@amwork/voximplant-apiclient-nodejs';

import { NotFoundError, PasswordUtil } from '@/common';

import { UserService } from '@/modules/iam/user/user.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { EntityService } from '@/CRM/Service/Entity/EntityService';

import { VoximplantApplicationParam } from '../common';
import { VoximplantAccountService } from '../voximplant-account';
import { VoximplantNumberService } from '../voximplant-number';

import {
  CreateVoximplantUserDto,
  CreateVoximplantUsersBatchDto,
  UpdateVoximplantUserDto,
  UsersQueueDto,
  VoximplantUserSIPDataDto,
} from './dto';
import { VoximplantUser } from './entities';

interface FindFilter {
  userId?: number;
  externalId?: number;
  userName?: string;
  isActive?: boolean;
  accessiblePhoneNumber?: string;
}

@Injectable()
export class VoximplantUserService {
  private readonly logger = new Logger(VoximplantUserService.name);
  constructor(
    @InjectRepository(VoximplantUser)
    private readonly repository: Repository<VoximplantUser>,
    private readonly entityService: EntityService,
    private readonly userService: UserService,
    private readonly viAccountService: VoximplantAccountService,
    private readonly viNumberService: VoximplantNumberService,
  ) {}

  public async create(accountId: number, userId: number, dto: CreateVoximplantUserDto): Promise<VoximplantUser | null> {
    const { client, appParam } = await this.viAccountService.getClient(accountId);
    const linkedUser = await this.userService.findOne({ accountId, id: userId });
    return this.createViUser(accountId, linkedUser, client, appParam, dto.isActive);
  }

  public async createBatch(accountId: number, dto: CreateVoximplantUsersBatchDto): Promise<VoximplantUser[]> {
    const { client, appParam } = await this.viAccountService.getClient(accountId);
    const users = await this.userService.findMany({ accountId, id: dto.userIds });
    const viUsers: VoximplantUser[] = [];
    for (const user of users) {
      const viUser = await this.createViUser(accountId, user, client, appParam, dto.isActive);
      if (viUser) {
        viUsers.push(viUser);
      }
    }
    return viUsers;
  }

  private async createViUser(
    accountId: number,
    linkedUser: User,
    client: VoximplantApiClient,
    appParam: VoximplantApplicationParam,
    isActive: boolean,
  ): Promise<VoximplantUser | null> {
    const viUser = {
      ...appParam,
      userName: `user-${linkedUser.id}`,
      userDisplayName: linkedUser.fullName,
      userPassword: PasswordUtil.generateSecure(),
      userActive: isActive,
    };
    const viResponse = await client.Users.addUser(viUser);
    if (!viResponse.result) {
      this.logger.error(`Create user error: ${JSON.stringify(viResponse)}`);
    }
    return viResponse.result
      ? await this.repository.save(
          new VoximplantUser(
            accountId,
            linkedUser.id,
            viResponse.userId,
            viUser.userName,
            viUser.userPassword,
            isActive,
          ),
        )
      : null;
  }

  public async findMany(accountId: number, filter?: FindFilter): Promise<VoximplantUser[]> {
    const viUsers = await this.createFindQb(accountId, filter).orderBy('viu.user_id', 'ASC').getMany();

    if (filter?.accessiblePhoneNumber) {
      const availableViUsers: VoximplantUser[] = [];
      for (const viUser of viUsers) {
        if (await this.viNumberService.checkAvailable(accountId, viUser.userId, filter.accessiblePhoneNumber)) {
          availableViUsers.push(viUser);
        }
      }

      return availableViUsers;
    }

    return viUsers;
  }

  public async findOne(accountId: number, filter?: FindFilter): Promise<VoximplantUser | null> {
    return this.createFindQb(accountId, filter).orderBy('viu.user_id', 'ASC').getOne();
  }

  public async getOne(accountId: number, userId: number): Promise<VoximplantUser> {
    const viUser = await this.findOne(accountId, { userId });
    if (!viUser) {
      throw NotFoundError.withId(VoximplantUser, userId);
    }
    return viUser;
  }

  public async update(accountId: number, userId: number, dto: UpdateVoximplantUserDto): Promise<VoximplantUser> {
    const viUser = await this.getOne(accountId, userId);
    await this.repository.save(viUser.update(dto));

    const { client, appParam } = await this.viAccountService.getClient(accountId);
    const request = {
      ...appParam,
      userId: viUser.externalId,
      userName: viUser.userName,
      userActive: viUser.isActive,
    };
    await client.Users.setUserInfo(request);

    if (!dto.isActive) {
      await this.viNumberService.removeUser(accountId, userId);
    }

    return viUser;
  }

  public async getUserName(accountId: number, userId: number): Promise<string | null> {
    const viUser = await this.findOne(accountId, { userId: userId });
    if (!viUser) {
      return null;
    }
    const viAccount = await this.viAccountService.getOne(accountId);
    return `${viUser.userName}@${viAccount.applicationName}`;
  }

  public async getLoginToken(accountId: number, userId: number, key: string): Promise<string | null> {
    const viUser = await this.getOne(accountId, userId);
    return this.calculateMD5(viUser.userName, viUser.password, key);
  }

  public async getSIPData(accountId: number, userId: number): Promise<VoximplantUserSIPDataDto | null> {
    const viUser = await this.findOne(accountId, { userId: userId });
    if (!viUser) {
      return null;
    }
    const viAccount = await this.viAccountService.getOne(accountId);
    return new VoximplantUserSIPDataDto({
      userName: viUser.userName,
      domain: viAccount.applicationName,
      password: viUser.password,
    });
  }

  public async delete(accountId: number, userId: number) {
    const viUser = await this.getOne(accountId, userId);

    const { client, appParam } = await this.viAccountService.getClient(accountId);
    const { result } = await client.Users.delUser({
      ...appParam,
      userId: viUser.externalId,
      userName: viUser.userName,
    });

    if (result) {
      await this.repository.delete({ accountId: accountId, userId });
    }
  }

  public async getUsersQueue(
    applicationId: number,
    { phone, viPhoneNumber }: { phone: string; viPhoneNumber?: string | null },
  ): Promise<UsersQueueDto | null> {
    const viAccount = await this.viAccountService.findOneExt({ applicationId });
    if (!viAccount) {
      return null;
    }

    const entity = phone
      ? await this.entityService.findOne(viAccount.accountId, {
          fieldValue: { type: FieldType.Phone, value: phone.startsWith('+') ? phone.slice(1) : phone },
        })
      : null;

    const operators = await this.findOperators(viAccount.accountId, {
      userId: entity?.responsibleUserId,
      viPhoneNumber,
    });

    return new UsersQueueDto({
      users: operators.map((o) => o.userName),
      entityName: entity?.name ?? null,
      entityId: entity?.id ?? null,
      entityTypeId: entity?.entityTypeId ?? null,
    });
  }

  private calculateMD5(user: string, password: string, key: string): string {
    const userHash = crypto.createHash('md5').update(`${user}:voximplant.com:${password}`).digest('hex');
    return crypto.createHash('md5').update(`${key}|${userHash}`).digest('hex');
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('viu').where('viu.account_id = :accountId', { accountId });

    if (filter?.userId) {
      qb.andWhere('viu.user_id = :userId', { userId: filter.userId });
    }

    if (filter?.externalId) {
      qb.andWhere('viu.external_id = :externalId', { externalId: filter.externalId });
    }

    if (filter?.userName) {
      qb.andWhere('viu.user_name = :userName', { userName: filter.userName });
    }

    if (filter?.isActive !== undefined) {
      qb.andWhere('viu.is_active = :isActive', { isActive: filter.isActive });
    }

    return qb;
  }

  private async findOperators(
    accountId: number,
    { userId, viPhoneNumber }: { userId?: number; viPhoneNumber?: string | null },
  ): Promise<VoximplantUser[]> {
    const queue = await this.findMany(accountId, { isActive: true, accessiblePhoneNumber: viPhoneNumber ?? undefined });
    const responsible = userId ? await this.findOne(accountId, { userId, isActive: true }) : null;

    return responsible ? [responsible, ...queue.filter((o) => o.userId !== responsible.userId)] : queue;
  }
}
