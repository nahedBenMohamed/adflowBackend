import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { CallDirection, CallStatus } from '../../common';
import { CreateVoximplantCallDto, UpdateVoximplantCallDto, VoximplantCallDto } from '../dto';

@Entity()
export class VoximplantCall {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  sessionId: string;

  @Column()
  callId: string;

  @Column()
  userId: number;

  @Column({ nullable: true })
  numberId: number | null;

  @Column({ nullable: true })
  entityId: number | null;

  @Column()
  direction: CallDirection;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  duration: number | null;

  @Column({ nullable: true })
  status: CallStatus | null;

  @Column({ nullable: true })
  failureReason: string | null;

  @Column({ nullable: true })
  recordUrl: string | null;

  @Column()
  accountId: number;

  @Column({ nullable: true })
  comment: string | null;

  @Column()
  createdAt: Date;

  private _entityInfo: EntityInfoDto = null;

  constructor(
    accountId: number,
    sessionId: string,
    callId: string,
    userId: number,
    numberId: number | null,
    entityId: number | null,
    direction: CallDirection,
    phoneNumber: string,
    duration: number | null,
    status: CallStatus | null,
    failureReason: string | null,
    recordUrl: string | null,
    comment: string,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.sessionId = sessionId;
    this.callId = callId;
    this.userId = userId;
    this.numberId = numberId;
    this.entityId = entityId;
    this.direction = direction;
    this.phoneNumber = phoneNumber;
    this.duration = duration;
    this.status = status;
    this.failureReason = failureReason;
    this.recordUrl = recordUrl;
    this.comment = comment ?? null;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  public get entityInfo(): EntityInfoDto {
    return this._entityInfo;
  }
  public set entityInfo(value: EntityInfoDto) {
    this._entityInfo = value;
  }

  public static fromDto(
    accountId: number,
    userId: number,
    dto: CreateVoximplantCallDto,
    createdAt?: Date,
  ): VoximplantCall {
    return new VoximplantCall(
      accountId,
      dto.sessionId,
      dto.callId,
      userId,
      dto.numberId,
      dto.entityId,
      dto.direction,
      dto.phoneNumber,
      dto.duration,
      dto.status,
      dto.failureReason,
      dto.recordUrl,
      null,
      createdAt,
    );
  }

  public update(userId: number | null | undefined, dto: UpdateVoximplantCallDto): VoximplantCall {
    this.userId = userId;
    this.entityId = dto.entityId;
    this.direction = dto.direction;
    this.phoneNumber = dto.phoneNumber;
    this.duration = dto.duration;
    this.status = dto.status;
    this.failureReason = dto.failureReason;
    this.recordUrl = dto.recordUrl;
    this.comment = dto.comment;

    return this;
  }

  public toDto(): VoximplantCallDto {
    return new VoximplantCallDto(
      this.id,
      this.sessionId,
      this.callId,
      this.userId,
      this.numberId,
      this.entityId,
      this.direction,
      this.phoneNumber,
      this.duration,
      this.status,
      this.failureReason,
      this.recordUrl,
      this.comment,
      this.createdAt.toISOString(),
      this._entityInfo,
    );
  }
}
