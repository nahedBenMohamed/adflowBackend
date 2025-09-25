import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ChatMessageScheduledDto, CreateChatMessageScheduledDto } from '../dto';

@Entity()
export class ChatMessageScheduled {
  @PrimaryGeneratedColumn('identity')
  id: number | undefined;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  @Column()
  sendFrom: number;

  @Column()
  providerId: number;

  @Column()
  message: string;

  @Column({ nullable: true })
  entityId: number | null;

  @Column({ nullable: true })
  phoneNumber: string | null;

  @Column({ default: false })
  onlyFirst: boolean;

  @Column({ nullable: true })
  sentAt: Date | null;

  constructor(
    accountId: number,
    sendFrom: number,
    providerId: number,
    message: string,
    entityId: number | null,
    phoneNumber: string | null,
    onlyFirst: boolean,
    createdAt: Date = new Date(),
    sentAt: Date | null = null,
  ) {
    this.accountId = accountId;
    this.sendFrom = sendFrom;
    this.createdAt = createdAt;
    this.providerId = providerId;
    this.message = message;
    this.entityId = entityId;
    this.phoneNumber = phoneNumber;
    this.onlyFirst = onlyFirst;
    this.sentAt = sentAt;
  }

  public static fromDto(accountId: number, dto: CreateChatMessageScheduledDto): ChatMessageScheduled {
    return new ChatMessageScheduled(
      accountId,
      dto.sendFrom,
      dto.providerId,
      dto.message,
      dto.entityId,
      dto.phoneNumber,
      dto.onlyFirst ?? false,
    );
  }

  public toDto(): ChatMessageScheduledDto {
    return {
      id: this.id,
      sendFrom: this.sendFrom,
      createdAt: this.createdAt.toISOString(),
      providerId: this.providerId,
      message: this.message,
      onlyFirst: this.onlyFirst,
      entityId: this.entityId,
      phoneNumber: this.phoneNumber,
      sentAt: this.sentAt?.toISOString(),
    };
  }
}
