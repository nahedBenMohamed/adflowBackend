import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { MailboxService } from '../mailbox/services';

import { CreateMailboxSignatureDto, UpdateMailboxSignatureDto } from './dto';
import { MailboxSignature, MailboxSignatureMailbox } from './entities';

interface FindFilter {
  accountId: number;
  signatureId?: number;
  accessibleUserId?: number;
  mailboxId?: number | number[];
}

@Injectable()
export class MailboxSignatureService {
  constructor(
    @InjectRepository(MailboxSignature)
    private readonly repositorySignature: Repository<MailboxSignature>,
    @InjectRepository(MailboxSignatureMailbox)
    private readonly repositoryLink: Repository<MailboxSignatureMailbox>,
    private readonly mailboxService: MailboxService,
  ) {}

  async create({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: CreateMailboxSignatureDto;
  }): Promise<MailboxSignature> {
    const signature = await this.repositorySignature.save(MailboxSignature.create(accountId, userId, dto));

    signature.mailboxes = await this.processLinks({
      accountId,
      signatureId: signature.id,
      mailboxIds: dto.linkedMailboxes,
    });

    return signature;
  }

  async findOne(filter: FindFilter): Promise<MailboxSignature | null> {
    return this.createQb(filter).getOne();
  }
  async findMany(filter: FindFilter): Promise<MailboxSignature[]> {
    if (!filter.mailboxId && filter.accessibleUserId) {
      const mailboxes = await this.mailboxService.findMany({
        accountId: filter.accountId,
        accessibleUserId: filter.accessibleUserId,
      });
      filter.mailboxId = mailboxes.map((m) => m.id);
    }
    return this.createQb(filter).orderBy('ms.created_at', 'ASC').getMany();
  }

  async update({
    accountId,
    signatureId,
    dto,
  }: {
    accountId: number;
    signatureId: number;
    dto: UpdateMailboxSignatureDto;
  }): Promise<MailboxSignature> {
    const signature = await this.findOne({ accountId, signatureId });
    if (!signature) {
      throw NotFoundError.withId(MailboxSignature, signatureId);
    }

    await this.repositorySignature.save(signature.update(dto));

    signature.mailboxes = await this.processLinks({
      accountId,
      signatureId: signature.id,
      mailboxIds: dto.linkedMailboxes,
    });

    return signature;
  }

  async delete({ accountId, signatureId }: { accountId: number; signatureId: number }) {
    await this.repositorySignature.delete({ accountId, id: signatureId });
  }

  private async processLinks({
    accountId,
    signatureId,
    mailboxIds,
  }: {
    accountId: number;
    signatureId: number;
    mailboxIds: number[] | null;
  }): Promise<MailboxSignatureMailbox[]> {
    await this.repositoryLink.delete({ accountId, signatureId });
    return mailboxIds?.length
      ? this.repositoryLink.save(
          mailboxIds.map((mailboxId) => new MailboxSignatureMailbox(accountId, signatureId, mailboxId)),
        )
      : [];
  }

  private createQb(filter: FindFilter) {
    const qb = this.repositorySignature
      .createQueryBuilder('ms')
      .leftJoinAndMapMany('ms.mailboxes', MailboxSignatureMailbox, 'msm', 'msm.signature_id = ms.id')
      .where('ms.account_id = :accountId', { accountId: filter.accountId });
    if (filter.signatureId) {
      qb.andWhere('ms.id = :signatureId', { signatureId: filter.signatureId });
    }
    if (filter.mailboxId) {
      if (Array.isArray(filter.mailboxId)) {
        if (filter.mailboxId.length) {
          qb.andWhere('msm.mailbox_id IN (:...mailboxIds)', { mailboxIds: filter.mailboxId });
        } else {
          qb.andWhere('1 = 0');
        }
      } else {
        qb.andWhere('msm.mailbox_id = :mailboxId', { mailboxId: filter.mailboxId });
      }
    }
    return qb;
  }
}
