import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { VoximplantAccountService } from '../../voximplant-account';

import { CreateVoximplantNumberDto, UpdateVoximplantNumberDto } from '../dto';
import { VoximplantNumber } from '../entities';
import { ExpandableField, PhoneNumber } from '../types';
import { VoximplantNumberUserService } from './voximplant-number-user.service';

interface FindFilter {
  id?: number;
  phoneNumber?: string;
  accessibleUserId?: number;
}
interface FindOptions {
  expand?: ExpandableField[];
}

@Injectable()
export class VoximplantNumberService {
  constructor(
    @InjectRepository(VoximplantNumber)
    private readonly repository: Repository<VoximplantNumber>,
    private readonly viAccountService: VoximplantAccountService,
    private readonly viNumberUserService: VoximplantNumberUserService,
  ) {}

  public async getAvailableNumbers(accountId: number): Promise<PhoneNumber[]> {
    const { client, appParam } = await this.viAccountService.getClient(accountId);

    const response = await client.PhoneNumbers.getPhoneNumbers(appParam);
    if (response.result) {
      const numbers: PhoneNumber[] = [];
      for (const number of response.result) {
        numbers.push(
          new PhoneNumber({
            externalId: number.phoneId.toString(),
            phoneNumber: number.phoneNumber,
            countryCode: number.phoneCountryCode,
            regionName: number.phoneRegionName,
          }),
        );
      }
      return numbers;
    }

    return [];
  }

  public async create(accountId: number, dto: CreateVoximplantNumberDto): Promise<VoximplantNumber> {
    const viNumber = await this.repository.save(VoximplantNumber.fromDto(accountId, dto));

    if (dto.userIds?.length) {
      viNumber.users = await this.viNumberUserService.create(accountId, viNumber.id, dto.userIds);
    }

    return viNumber;
  }

  public async findOne(
    accountId: number,
    filter?: FindFilter,
    options?: FindOptions,
  ): Promise<VoximplantNumber | null> {
    const viNumber = await this.createFindQb(accountId, filter).getOne();
    return viNumber && options?.expand ? await this.expandOne(viNumber, options.expand) : viNumber;
  }

  public async findMany(accountId: number, filter?: FindFilter, options?: FindOptions): Promise<VoximplantNumber[]> {
    const viNumbers = await this.createFindQb(accountId, filter).orderBy('vin.id').getMany();
    return viNumbers && options?.expand ? await this.expandMany(viNumbers, options.expand) : viNumbers;
  }

  public async getCount(accountId: number, filter?: FindFilter): Promise<number> {
    return this.createFindQb(accountId, filter).getCount();
  }

  public async checkAvailable(accountId: number, userId: number, phoneNumber: string): Promise<boolean> {
    return (await this.getCount(accountId, { accessibleUserId: userId, phoneNumber })) > 0;
  }

  public async update(accountId: number, numberId: number, dto: UpdateVoximplantNumberDto): Promise<VoximplantNumber> {
    const viNumber = await this.findOne(accountId, { id: numberId }, { expand: ['users'] });

    await this.repository.save(viNumber.update(dto));

    if (dto.userIds) {
      viNumber.users = await this.viNumberUserService.update(accountId, viNumber.id, viNumber.users, dto.userIds);
    }

    return viNumber;
  }

  public async delete(accountId: number, numberId: number) {
    await this.repository.delete({ accountId, id: numberId });
  }

  public async removeUser(accountId: number, userId: number) {
    await this.viNumberUserService.removeUser(accountId, userId);
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository.createQueryBuilder('vin').where('vin.account_id = :accountId', { accountId });

    if (filter?.id) {
      qb.andWhere('vin.id = :id', { id: filter.id });
    }
    if (filter?.phoneNumber) {
      qb.andWhere('vin.phone_number ilike :phoneNumber', { phoneNumber: `%${filter.phoneNumber}%` });
    }
    if (filter?.accessibleUserId) {
      qb.leftJoin('voximplant_number_user', 'vinu', 'vinu.number_id = vin.id').andWhere(
        new Brackets((qb1) =>
          qb1
            .where('vinu.user_id = :accessibleUserId', { accessibleUserId: filter.accessibleUserId })
            .orWhere('vinu.user_id is NULL'),
        ),
      );
    }

    return qb;
  }

  private async expandOne(viNumber: VoximplantNumber, expand: ExpandableField[]): Promise<VoximplantNumber> {
    if (expand.includes('users')) {
      viNumber.users = await this.viNumberUserService.findMany(viNumber.accountId, { numberId: viNumber.id });
    }
    return viNumber;
  }
  private async expandMany(viNumbers: VoximplantNumber[], expand: ExpandableField[]): Promise<VoximplantNumber[]> {
    return await Promise.all(viNumbers.map((viNumber) => this.expandOne(viNumber, expand)));
  }
}
