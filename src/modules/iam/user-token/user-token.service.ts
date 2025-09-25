import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { DateUtil, TokenService } from '@/common';

import { CreateUserTokenDto } from './dto';
import { UserToken } from './entities';
import { UserAccessToken } from './types';

interface FindFilter {
  accountId: number;
  userId: number;
  tokenId?: number;
  code?: string;
}

@Injectable()
export class UserTokenService {
  constructor(
    @InjectRepository(UserToken)
    private readonly repository: Repository<UserToken>,
    private readonly tokenService: TokenService,
  ) {}

  async create({
    accountId,
    subdomain,
    userId,
    dto,
  }: {
    accountId: number;
    subdomain: string;
    userId: number;
    dto: CreateUserTokenDto;
  }): Promise<UserAccessToken> {
    const code = uuidv4();
    const expiresIn = dto.expiresAt
      ? DateUtil.diff({ startDate: DateUtil.now(), endDate: DateUtil.fromISOString(dto.expiresAt), unit: 'second' })
      : undefined;
    const accessToken = this.tokenService.create(
      { accountId, userId, subdomain, code },
      expiresIn ? { expiresIn } : undefined,
    );

    const userToken = UserToken.fromDto({ accountId, userId, data: { ...dto, code } });
    await this.repository.insert(userToken);

    return new UserAccessToken({ accessToken, userToken });
  }

  async findOne(filter: FindFilter): Promise<UserToken | null> {
    return this.createQb(filter).getOne();
  }
  async findMany(filter: FindFilter): Promise<UserToken[]> {
    return this.createQb(filter).getMany();
  }

  async use(filter: FindFilter): Promise<UserToken | null> {
    const token = await this.findOne(filter);
    if (token) {
      const now = DateUtil.now();
      await this.repository.update({ id: token.id }, { lastUsedAt: now });
      token.lastUsedAt = now;
    }

    return token;
  }

  async delete({
    accountId,
    userId,
    tokenId,
  }: {
    accountId: number;
    userId: number;
    tokenId: number;
  }): Promise<number | null> {
    const { affected } = await this.repository.delete({ accountId, userId, id: tokenId });
    return affected ? tokenId : null;
  }

  private createQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('token')
      .where('token.account_id = :accountId', { accountId: filter.accountId })
      .andWhere('token.user_id = :userId', { userId: filter.userId });

    if (filter.tokenId) {
      qb.andWhere('token.id = :tokenId', { tokenId: filter.tokenId });
    }
    if (filter.code) {
      qb.andWhere('token.code = :code', { code: filter.code });
    }

    return qb;
  }
}
