import { Column, Entity, PrimaryColumn } from 'typeorm';

import { MailboxEntitySettingsDto } from '../dto';

@Entity()
export class MailboxEntitySettings {
  @Column()
  accountId: number;

  @PrimaryColumn()
  mailboxId: number;

  @Column({ nullable: true })
  contactEntityTypeId: number | null;

  @Column({ nullable: true })
  leadEntityTypeId: number | null;

  @Column({ nullable: true })
  leadBoardId: number | null;

  @Column({ nullable: true })
  leadStageId: number | null;

  @Column({ nullable: true })
  leadName: string | null;

  @Column({ nullable: true })
  ownerId: number | null;

  @Column({ default: false })
  checkActiveLead: boolean;

  @Column({ default: false })
  checkDuplicate: boolean;

  constructor(
    accountId: number,
    mailboxId: number,
    contactEntityTypeId: number | null,
    leadEntityTypeId: number | null,
    leadBoardId: number | null,
    leadStageId: number | null,
    leadName: string | null,
    ownerId: number | null,
    checkActiveLead: boolean,
    checkDuplicate: boolean,
  ) {
    this.accountId = accountId;
    this.mailboxId = mailboxId;
    this.contactEntityTypeId = contactEntityTypeId;
    this.leadEntityTypeId = leadEntityTypeId;
    this.leadBoardId = leadBoardId;
    this.leadStageId = leadStageId;
    this.leadName = leadName;
    this.ownerId = ownerId;
    this.checkActiveLead = checkActiveLead;
    this.checkDuplicate = checkDuplicate;
  }

  static fromDto({
    accountId,
    mailboxId,
    dto,
  }: {
    accountId: number;
    mailboxId: number;
    dto: MailboxEntitySettingsDto;
  }): MailboxEntitySettings {
    return new MailboxEntitySettings(
      accountId,
      mailboxId,
      dto.contactEntityTypeId,
      dto.leadEntityTypeId,
      dto.leadBoardId,
      dto.leadStageId,
      dto.leadName,
      dto.ownerId,
      dto.checkActiveLead ?? false,
      dto.checkDuplicate ?? false,
    );
  }

  update(dto: MailboxEntitySettingsDto): MailboxEntitySettings {
    this.contactEntityTypeId =
      dto.contactEntityTypeId !== undefined ? dto.contactEntityTypeId : this.contactEntityTypeId;
    this.leadEntityTypeId = dto.leadEntityTypeId !== undefined ? dto.leadEntityTypeId : this.leadEntityTypeId;
    this.leadBoardId = dto.leadBoardId !== undefined ? dto.leadBoardId : this.leadBoardId;
    this.leadStageId = dto.leadStageId !== undefined ? dto.leadStageId : this.leadStageId;
    this.leadName = dto.leadName !== undefined ? dto.leadName : this.leadName;
    this.ownerId = dto.ownerId !== undefined ? dto.ownerId : this.ownerId;
    this.checkActiveLead = dto.checkActiveLead !== undefined ? dto.checkActiveLead : this.checkActiveLead;
    this.checkDuplicate = dto.checkDuplicate !== undefined ? dto.checkDuplicate : this.checkDuplicate;

    return this;
  }

  toDto(): MailboxEntitySettingsDto {
    return {
      contactEntityTypeId: this.contactEntityTypeId,
      leadEntityTypeId: this.leadEntityTypeId,
      leadBoardId: this.leadBoardId,
      leadStageId: this.leadStageId,
      leadName: this.leadName,
      ownerId: this.ownerId,
      checkActiveLead: this.checkActiveLead,
      checkDuplicate: this.checkDuplicate,
    };
  }
}
