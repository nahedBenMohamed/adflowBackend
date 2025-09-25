import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MailboxAccessibleUser } from '../entities';

@Injectable()
export class MailboxAccessibleUserService {
  constructor(
    @InjectRepository(MailboxAccessibleUser)
    private readonly repository: Repository<MailboxAccessibleUser>,
  ) {}

  async create({
    accountId,
    mailboxId,
    userIds,
  }: {
    accountId: number;
    mailboxId: number;
    userIds: number[];
  }): Promise<MailboxAccessibleUser[]> {
    return this.repository.save(userIds.map((userId) => new MailboxAccessibleUser(accountId, mailboxId, userId)));
  }

  async findMany({ accountId, mailboxId }: { accountId: number; mailboxId: number }): Promise<MailboxAccessibleUser[]> {
    return this.repository
      .createQueryBuilder('mau')
      .where('mau.account_id = :accountId', { accountId })
      .andWhere('mau.mailbox_id = :mailboxId', { mailboxId })
      .getMany();
  }

  async update({
    accountId,
    mailboxId,
    currentUsers,
    userIds,
  }: {
    accountId: number;
    mailboxId: number;
    currentUsers: MailboxAccessibleUser[];
    userIds: number[];
  }): Promise<MailboxAccessibleUser[]> {
    const addUsers = userIds.filter((id) => !currentUsers.some((user) => user.userId === id));
    const removeUsers = currentUsers.filter((user) => !userIds.some((id) => id === user.userId));

    currentUsers.push(...(await this.create({ accountId, mailboxId, userIds: addUsers })));

    if (removeUsers.length > 0) {
      await this.repository.remove(removeUsers);
    }

    return currentUsers.filter((user) => !removeUsers.some((u) => u.userId === user.userId));
  }
}
