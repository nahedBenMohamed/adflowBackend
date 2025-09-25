import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UpdateUserProfileDto } from './dto';
import { UserProfile } from './entities';

const cacheKey = ({ accountId, userId }: { accountId: number; userId: number }) => `UserProfile:${accountId}:${userId}`;

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly repository: Repository<UserProfile>,
    private readonly dataSource: DataSource,
  ) {}

  public async create({ accountId, userId }: { accountId: number; userId: number }): Promise<UserProfile> {
    this.dataSource.queryResultCache?.remove([cacheKey({ accountId, userId })]);
    return this.repository.save(new UserProfile(accountId, userId, null, null, null, null));
  }

  public async findOne({ accountId, userId }: { accountId: number; userId: number }): Promise<UserProfile> {
    const profile = await this.repository.findOne({
      where: { accountId, userId },
      cache: { id: cacheKey({ accountId, userId }), milliseconds: 86400000 },
    });

    return profile ?? this.create({ accountId, userId });
  }

  public async update({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: UpdateUserProfileDto;
  }): Promise<UserProfile> {
    const profile = await this.findOne({ accountId, userId });
    this.dataSource.queryResultCache?.remove([cacheKey({ accountId, userId })]);
    await this.repository.save(profile.update(dto));

    return profile;
  }
}
