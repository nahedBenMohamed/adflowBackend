import { Column, Entity, PrimaryColumn } from 'typeorm';

import { ChatProviderEntitySettingsDto } from '../dto';

@Entity()
export class ChatProviderEntitySettings {
  @Column()
  accountId: number;

  @PrimaryColumn()
  providerId: number;

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
    providerId: number,
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
    this.providerId = providerId;
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
    providerId,
    dto,
  }: {
    accountId: number;
    providerId: number;
    dto: ChatProviderEntitySettingsDto;
  }): ChatProviderEntitySettings {
    return new ChatProviderEntitySettings(
      accountId,
      providerId,
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

  update(dto: ChatProviderEntitySettingsDto): ChatProviderEntitySettings {
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

  toDto(): ChatProviderEntitySettingsDto {
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
