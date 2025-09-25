import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { ChatUserRole } from '../common';
import { ChatUserExternalDto } from './dto';
import { ChatUser, ChatUserExternal } from './entities';

interface FindFilter {
  id?: number;
  chatId?: number;
  userId?: number;
  providerId?: number;
  externalId?: string;
  role?: ChatUserRole;
}

@Injectable()
export class ChatUserService {
  constructor(
    @InjectRepository(ChatUser)
    private readonly repository: Repository<ChatUser>,
    @InjectRepository(ChatUserExternal)
    private readonly extRepository: Repository<ChatUserExternal>,
  ) {}

  async createForChat(
    accountId: number,
    chatId: number,
    {
      ownerIds,
      userIds,
      supervisorIds,
      externalUsers,
    }: {
      ownerIds: number[];
      userIds?: number[];
      supervisorIds?: number[];
      externalUsers?: ChatUserExternalDto[];
    },
  ): Promise<ChatUser[]> {
    const chatUsers: ChatUser[] = [];

    for (const ownerId of ownerIds) {
      chatUsers.push(await this.repository.save(new ChatUser(accountId, chatId, ChatUserRole.OWNER, ownerId)));
    }

    if (userIds?.length > 0) {
      for (const userId of userIds.filter((id) => !chatUsers.some((u) => u.userId === id))) {
        chatUsers.push(await this.repository.save(new ChatUser(accountId, chatId, ChatUserRole.USER, userId)));
      }
    }

    if (supervisorIds?.length > 0) {
      for (const supervisorId of supervisorIds.filter((id) => !chatUsers.some((u) => u.userId === id))) {
        chatUsers.push(
          await this.repository.save(new ChatUser(accountId, chatId, ChatUserRole.SUPERVISOR, supervisorId)),
        );
      }
    }

    if (externalUsers?.length > 0) {
      for (const extUserDto of externalUsers) {
        const user = await this.repository.save(new ChatUser(accountId, chatId, ChatUserRole.EXTERNAL, null));
        user.externalUser = await this.extRepository.save(ChatUserExternal.fromDto(accountId, user.id, extUserDto));
        chatUsers.push(user);
      }
    }

    return chatUsers;
  }

  async findOne(accountId: number, filter: FindFilter): Promise<ChatUser> {
    return this.createFindQb(accountId, filter).getOne();
  }
  async getOne(accountId: number, filter: FindFilter): Promise<ChatUser> {
    const chatUser = await this.findOne(accountId, filter);

    if (!chatUser) {
      throw new NotFoundError(`User ${filter?.userId} not found in chat ${filter?.chatId}`);
    }

    return chatUser;
  }
  async findMany(accountId: number, filter: FindFilter): Promise<ChatUser[]> {
    return this.createFindQb(accountId, filter).getMany();
  }
  async count(accountId: number, filter: FindFilter): Promise<number> {
    return this.createFindQb(accountId, filter).getCount();
  }

  async updateForGroupChat(
    accountId: number,
    chatId: number,
    ownerId: number,
    currentUsers: ChatUser[],
    participantIds: number[],
  ): Promise<ChatUser[]> {
    const removeUsers = currentUsers
      .filter((user) => user.role !== ChatUserRole.EXTERNAL)
      .filter((user) => !participantIds.some((id) => id === user.userId))
      .filter((user) => user.userId !== ownerId);

    const addedUsers = await this.addUsers({ accountId, chatId, userIds: participantIds, currentUsers });
    if (addedUsers.length) {
      currentUsers.push(...addedUsers);
    }

    if (removeUsers.length > 0) {
      await this.repository.remove(removeUsers);
    }

    return currentUsers.filter((user) => !removeUsers.some((u) => u.userId === user.userId));
  }

  async addUsers({
    accountId,
    chatId,
    userIds,
    currentUsers,
    externalUsers,
  }: {
    accountId: number;
    chatId: number;
    userIds?: number[] | null;
    currentUsers?: ChatUser[];
    externalUsers?: ChatUserExternalDto[] | null;
  }): Promise<ChatUser[]> {
    const chatUsers: ChatUser[] = [];

    if (userIds) {
      const users = currentUsers ?? (await this.findMany(accountId, { chatId }));
      const addUsers = userIds.filter((id) => !users.some((user) => user.userId === id));
      for (const userId of addUsers) {
        chatUsers.push(await this.repository.save(new ChatUser(accountId, chatId, ChatUserRole.USER, userId)));
      }
    }

    if (externalUsers) {
      for (const extUserDto of externalUsers) {
        const user = await this.repository.save(new ChatUser(accountId, chatId, ChatUserRole.EXTERNAL, null));
        user.externalUser = await this.extRepository.save(ChatUserExternal.fromDto(accountId, user.id, extUserDto));
        chatUsers.push(user);
      }
    }

    return chatUsers;
  }

  async updateExternalUser(accountId: number, chatUser: ChatUser, dto: ChatUserExternalDto): Promise<ChatUser> {
    const extUser = await this.extRepository.findOneBy({ accountId, chatUserId: chatUser.id });

    await this.extRepository.save(extUser.update(dto));

    chatUser.externalUser = extUser;
    return chatUser;
  }

  private createFindQb(accountId: number, filter?: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('user')
      .leftJoinAndMapOne('user.externalUser', ChatUserExternal, 'ext_user', `ext_user.chat_user_id = user.id`)
      .where('user.account_id = :accountId', { accountId });

    if (filter?.id) {
      qb.andWhere('user.id = :id', { id: filter.id });
    }

    if (filter?.chatId) {
      qb.andWhere('user.chat_id = :chatId', { chatId: filter.chatId });
    }

    if (filter?.userId) {
      qb.andWhere('user.user_id = :userId', { userId: filter.userId });
    }

    if (filter?.externalId) {
      qb.andWhere('ext_user.external_id = :externalId', { externalId: filter.externalId });
    }

    if (filter?.providerId) {
      qb.leftJoin('chat', 'chat', 'user.chat_id = chat.id').andWhere('chat.provider_id = :providerId', {
        providerId: filter.providerId,
      });
    }

    if (filter?.role) {
      qb.andWhere('user.role = :role', { role: filter.role });
    }

    return qb;
  }
}
